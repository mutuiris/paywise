"""Application services for approval policy enforcement and decision recording."""

from __future__ import annotations

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from django.conf import settings
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction

from apps.accounts.models import UserRole
from apps.approvals.models import Approval, ApprovalDecision, ApprovalTier
from apps.audit import services as audit_services
from apps.payments.models import PaymentRequest, PaymentRequestStatus

if TYPE_CHECKING:
    from apps.accounts.models import UserAccount


def get_approval_threshold() -> Decimal:
    """Return the configured approval threshold from Django settings."""
    return getattr(settings, "PAYMENT_APPROVAL_THRESHOLD", Decimal("50000.00"))


def get_required_tiers(amount: Decimal) -> list[str]:
    """Return the list of required approval tiers based on payment amount.

    Payments of KES 50,000.00 or less require only Manager approval.
    Payments exceeding KES 50,000.00 require both Manager and Finance approval.
    """
    if amount <= get_approval_threshold():
        return [ApprovalTier.MANAGER]
    return [ApprovalTier.MANAGER, ApprovalTier.FINANCE]


def can_approve_tier(user: UserAccount, tier: str) -> bool:
    """Check if the user has the necessary role to approve the specified tier."""
    if not getattr(user, "is_active", False):
        return False
    if getattr(user, "is_superuser", False):
        return True
    role = getattr(user, "role", None)
    if tier == ApprovalTier.MANAGER:
        return role in (UserRole.MANAGER, UserRole.ADMINISTRATOR)
    if tier == ApprovalTier.FINANCE:
        return role in (UserRole.FINANCE_OFFICER, UserRole.ADMINISTRATOR)
    return False


def record_approval_decision(
    *,
    payment_request_id: uuid.UUID,
    approver: UserAccount,
    tier: str,
    decision: str,
    reason: str = "",
) -> tuple[Approval, PaymentRequest]:
    """Atomically record an approval or rejection decision.

    Enforces tier prerequisites, prevents self-approval, serialises
    concurrent decisions with PostgreSQL row locking, and emits audit events.
    """
    if not getattr(approver, "is_active", False):
        raise PermissionDenied(
            "Inactive users cannot approve or reject payment requests."
        )

    if not can_approve_tier(approver, tier):
        raise PermissionDenied(
            f"User role is not authorized to make decisions at {tier} tier."
        )

    clean_reason = reason.strip()
    if decision == ApprovalDecision.REJECTED and not clean_reason:
        raise ValidationError(
            {
                "reason": (
                    "A nonblank reason is required when rejecting a payment request."
                )
            }
        )

    with transaction.atomic():
        payment_request = (
            PaymentRequest.objects.select_for_update()
            .filter(id=payment_request_id)
            .first()
        )
        if payment_request is None:
            raise ValidationError({"payment_request": "Payment request not found."})

        if payment_request.status not in (
            PaymentRequestStatus.SUBMITTED,
            PaymentRequestStatus.PENDING_APPROVAL,
        ):
            raise ValidationError(
                {
                    "status": (
                        "Cannot record decision on a payment request with "
                        f"status '{payment_request.status}'."
                    )
                }
            )

        is_requester = (
            payment_request.requester is not None
            and payment_request.requester.id == approver.id
        )
        is_creator = payment_request.created_by == approver.id
        if is_requester or is_creator:
            raise ValidationError(
                {
                    "approver": (
                        "Requesters and creators cannot approve their own "
                        "payment requests."
                    )
                }
            )

        required_tiers = get_required_tiers(payment_request.amount)
        if tier not in required_tiers:
            raise ValidationError(
                {
                    "tier": (
                        f"Tier '{tier}' is not required for an amount of "
                        f"{payment_request.amount} {payment_request.currency}."
                    )
                }
            )

        already_approved = Approval.objects.filter(
            payment_request=payment_request,
            tier=tier,
            is_active=True,
            decision=ApprovalDecision.APPROVED,
        ).exists()
        if already_approved:
            raise ValidationError({"tier": f"Tier '{tier}' has already been approved."})

        if tier == ApprovalTier.FINANCE:
            manager_approved = Approval.objects.filter(
                payment_request=payment_request,
                tier=ApprovalTier.MANAGER,
                is_active=True,
                decision=ApprovalDecision.APPROVED,
            ).exists()
            if not manager_approved:
                raise ValidationError(
                    {"tier": "Manager approval is required before finance approval."}
                )

        approval = Approval.objects.create(
            payment_request=payment_request,
            approver=approver,
            tier=tier,
            decision=decision,
            reason=clean_reason,
            created_by=approver.id,
            updated_by=approver.id,
        )

        if decision == ApprovalDecision.REJECTED:
            payment_request.status = PaymentRequestStatus.REJECTED
            payment_request.rejection_reason = clean_reason
            payment_request.updated_by = approver.id
            payment_request.save()

            audit_services.record_payment_request_rejected(
                actor=approver,
                payment_request_id=payment_request.id,
                tier=tier,
                reason=clean_reason,
                metadata={
                    "amount": str(payment_request.amount),
                    "invoice": payment_request.invoice_number,
                },
            )
            return approval, payment_request

        active_approved_tiers = set(
            Approval.objects.filter(
                payment_request=payment_request,
                is_active=True,
                decision=ApprovalDecision.APPROVED,
            ).values_list("tier", flat=True)
        )

        if all(req_tier in active_approved_tiers for req_tier in required_tiers):
            payment_request.status = PaymentRequestStatus.APPROVED
        else:
            payment_request.status = PaymentRequestStatus.PENDING_APPROVAL

        payment_request.updated_by = approver.id
        payment_request.save()

        audit_services.record_payment_request_approved(
            actor=approver,
            payment_request_id=payment_request.id,
            tier=tier,
            metadata={
                "amount": str(payment_request.amount),
                "invoice": payment_request.invoice_number,
                "is_fully_approved": payment_request.status
                == PaymentRequestStatus.APPROVED,
            },
        )

        return approval, payment_request


def invalidate_existing_approvals(
    payment_request: PaymentRequest,
    *,
    actor: UserAccount,
    reason: str = "Material amount change",
) -> int:
    """Invalidate previously granted approvals following an amount modification.

    Sets is_active=False on active approvals, recalculates required tiers,
    updates the payment request status to PENDING_APPROVAL, and emits an audit event.
    """
    with transaction.atomic():
        updated_count = Approval.objects.filter(
            payment_request=payment_request,
            is_active=True,
        ).update(is_active=False, updated_by=actor.id)

        if updated_count > 0:
            payment_request.status = PaymentRequestStatus.PENDING_APPROVAL
            payment_request.updated_by = actor.id
            payment_request.save()

            audit_services.record_approval_invalidated(
                actor=actor,
                payment_request_id=payment_request.id,
                metadata={"reason": reason, "invalidated_count": updated_count},
            )

        return updated_count
