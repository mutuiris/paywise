"""Application services orchestrating approval policies, concurrency, and decisions."""

from __future__ import annotations

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from django.conf import settings
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import IntegrityError, transaction
from django.db.models import Q, QuerySet

from apps.accounts.models import UserRole
from apps.approvals.models import Approval, ApprovalDecision, ApprovalTier
from apps.approvals.permissions import (
    can_approve_finance_tier,
    can_approve_manager_tier,
    check_can_approve_request,
    check_can_reject_request,
)
from apps.audit import services as audit_services
from apps.payments.models import PaymentRequest, PaymentRequestStatus

if TYPE_CHECKING:
    from apps.accounts.models import UserAccount


def get_approval_threshold() -> Decimal:
    """Return the configured approval threshold from Django settings."""
    return getattr(settings, "PAYMENT_APPROVAL_THRESHOLD", Decimal("50000.00"))


def get_required_tiers(target: PaymentRequest | Decimal) -> list[str]:
    """Calculate the required approval tiers based on payment amount.

    Payments of KES 50,000.00 or less require Manager approval only.
    Payments exceeding KES 50,000.00 require both Manager and Finance sign-off.
    """
    amount = target.amount if isinstance(target, PaymentRequest) else target
    if amount <= get_approval_threshold():
        return [ApprovalTier.MANAGER]
    return [ApprovalTier.MANAGER, ApprovalTier.FINANCE]


def can_approve_tier(user: UserAccount | Any, tier: str) -> bool:
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


def get_recorded_approvals(payment_request: PaymentRequest) -> QuerySet[Approval]:
    """Return all active approval decisions recorded for a payment request."""
    return Approval.objects.filter(
        payment_request=payment_request,
        is_active=True,
    ).select_related("approver")


def get_approved_tiers(payment_request: PaymentRequest) -> list[str]:
    """Return list of distinct tiers that have recorded an APPROVED decision."""
    return list(
        Approval.objects.filter(
            payment_request=payment_request,
            decision=ApprovalDecision.APPROVED,
            is_active=True,
        )
        .values_list("tier", flat=True)
        .distinct()
    )


def get_pending_tiers(payment_request: PaymentRequest) -> list[str]:
    """Return required tiers that have not yet recorded an APPROVED decision."""
    required = get_required_tiers(payment_request)
    approved = get_approved_tiers(payment_request)
    return [tier for tier in required if tier not in approved]


def is_fully_approved(payment_request: PaymentRequest) -> bool:
    """Check whether all required approval tiers have been satisfied."""
    return len(get_pending_tiers(payment_request)) == 0


@transaction.atomic
def record_approval(
    *,
    payment_request: PaymentRequest,
    approver: UserAccount | Any,
    tier: str | None = None,
    decision: str = ApprovalDecision.APPROVED,
    reason: str = "",
) -> Approval:
    """Record an approval or rejection decision and transition request state.

    Enforces:
    1. Row-level locking to eliminate concurrent approval race conditions.
    2. Prevention of duplicate logical approvals for the same tier.
    3. Stale state protection (rejecting decisions on already decided requests).
    4. Requesters cannot approve their own requests (self-approval ban).
    5. Threshold policy: <= threshold requires Manager; > threshold requires
       Manager and Finance.
    6. Mandatory non-empty reason on rejection.
    """
    try:
        locked_request = PaymentRequest.objects.select_for_update().get(
            id=payment_request.id
        )
    except PaymentRequest.DoesNotExist as exc:
        raise ValidationError(
            {"payment_request": "Payment request not found."}
        ) from exc

    if locked_request.status == PaymentRequestStatus.REJECTED:
        raise ValidationError(
            {
                "payment_request": (
                    "Cannot approve or reject an already rejected payment request."
                )
            }
        )
    if locked_request.status == PaymentRequestStatus.APPROVED:
        if decision == ApprovalDecision.APPROVED:
            raise ValidationError(
                {"payment_request": "Payment request has already been fully approved."}
            )
        raise ValidationError(
            {"payment_request": ("Cannot reject an already approved payment request.")}
        )
    if locked_request.status not in (
        PaymentRequestStatus.PENDING_APPROVAL,
        PaymentRequestStatus.SUBMITTED,
    ):
        raise ValidationError(
            {
                "payment_request": (
                    f"Cannot decide on payment request in "
                    f"'{locked_request.status}' state."
                )
            }
        )

    if decision == ApprovalDecision.REJECTED:
        check_can_reject_request(approver, locked_request)
        if not reason or not reason.strip():
            raise ValidationError(
                {"reason": "A reason is mandatory when rejecting a payment request."}
            )
    else:
        check_can_approve_request(approver, locked_request, tier=tier)

    if tier is None:
        role = getattr(approver, "role", None)
        pending = get_pending_tiers(locked_request)
        if role == UserRole.MANAGER and ApprovalTier.MANAGER in pending:
            tier = ApprovalTier.MANAGER
        elif role == UserRole.FINANCE_OFFICER and ApprovalTier.FINANCE in pending:
            tier = ApprovalTier.FINANCE
        elif role == UserRole.ADMINISTRATOR and pending:
            tier = pending[0]
        elif ApprovalTier.MANAGER in pending and can_approve_manager_tier(approver):
            tier = ApprovalTier.MANAGER
        elif ApprovalTier.FINANCE in pending and can_approve_finance_tier(approver):
            tier = ApprovalTier.FINANCE
        else:
            raise ValidationError(
                {"tier": "Unable to determine applicable approval tier for user role."}
            )

    if decision != ApprovalDecision.REJECTED:
        check_can_approve_request(approver, locked_request, tier=tier)

    required_tiers = get_required_tiers(locked_request)
    if tier not in required_tiers:
        raise ValidationError(
            {
                "tier": (
                    f"Tier '{tier}' is not required for request amount of "
                    f"{locked_request.amount} {locked_request.currency}."
                )
            }
        )

    if decision == ApprovalDecision.APPROVED and (
        tier in get_approved_tiers(locked_request)
        or Approval.objects.filter(
            payment_request=locked_request,
            tier=tier,
            decision=ApprovalDecision.APPROVED,
            is_active=True,
        ).exists()
    ):
        raise ValidationError(
            {
                "tier": (
                    f"Tier '{tier}' has already been approved for this payment request."
                )
            }
        )

    try:
        approval = Approval(
            payment_request=locked_request,
            approver=approver,
            tier=tier,
            decision=decision,
            reason=reason.strip(),
            created_by=approver.id,
            updated_by=approver.id,
        )
        approval.save()
    except IntegrityError as exc:
        raise ValidationError(
            {"detail": "Duplicate or conflicting approval decision recorded."}
        ) from exc

    if decision == ApprovalDecision.REJECTED:
        locked_request.status = PaymentRequestStatus.REJECTED
        locked_request.rejection_reason = reason.strip()
        locked_request.updated_by = approver.id
        locked_request.save(
            update_fields=["status", "rejection_reason", "updated_by", "updated_at"]
        )
        audit_services.log_payment_request_rejected(
            locked_request,
            rejecter=approver,
            reason=reason.strip(),
            tier=tier,
        )
    elif decision == ApprovalDecision.APPROVED:
        if is_fully_approved(locked_request):
            locked_request.status = PaymentRequestStatus.APPROVED
            locked_request.updated_by = approver.id
            locked_request.save(update_fields=["status", "updated_by", "updated_at"])
        else:
            if locked_request.status != PaymentRequestStatus.PENDING_APPROVAL:
                locked_request.status = PaymentRequestStatus.PENDING_APPROVAL
                locked_request.updated_by = approver.id
                locked_request.save(
                    update_fields=["status", "updated_by", "updated_at"]
                )
        audit_services.log_payment_request_approved(
            locked_request,
            approver=approver,
            tier=tier,
            reason=reason.strip(),
        )

    return approval


def record_approval_decision(
    *,
    payment_request_id: uuid.UUID,
    approver: UserAccount,
    tier: str,
    decision: str,
    reason: str = "",
) -> tuple[Approval, PaymentRequest]:
    """Atomically record an approval or rejection decision by payment request ID.

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


@transaction.atomic
def re_evaluate_approval_state(
    payment_request: PaymentRequest,
    *,
    actor_id: Any | None = None,
) -> bool:
    """Invalidate recorded approvals and reset status when request changes."""
    locked_request = PaymentRequest.objects.select_for_update().get(
        id=payment_request.id
    )
    active_approvals = Approval.objects.filter(
        payment_request=locked_request,
        is_active=True,
    )
    if active_approvals.exists():
        active_approvals.update(is_active=False)
        locked_request.status = PaymentRequestStatus.PENDING_APPROVAL
        if actor_id:
            locked_request.updated_by = actor_id
        locked_request.save(update_fields=["status", "updated_by", "updated_at"])
        return True
    return False


@transaction.atomic
def update_payment_request_amount(
    *,
    payment_request: PaymentRequest,
    new_amount: Decimal,
    actor: UserAccount | Any | None = None,
) -> PaymentRequest:
    """Update payment request amount and invalidate prior approval decisions.

    Enforces that material changes to amount require full approval re-evaluation.
    """
    if new_amount <= Decimal("0.00"):
        raise ValidationError({"amount": "Amount must be greater than zero."})

    locked_request = PaymentRequest.objects.select_for_update().get(
        id=payment_request.id
    )
    if locked_request.status in (
        PaymentRequestStatus.PROCESSING,
        PaymentRequestStatus.PAID,
    ):
        raise ValidationError(
            {
                "amount": (
                    f"Cannot alter amount for request in "
                    f"'{locked_request.status}' state."
                )
            }
        )

    if locked_request.amount == new_amount:
        return locked_request

    locked_request.amount = new_amount
    if actor:
        locked_request.updated_by = actor.id

    active_approvals = Approval.objects.filter(
        payment_request=locked_request,
        is_active=True,
    )
    if active_approvals.exists():
        active_approvals.update(is_active=False)
        locked_request.status = PaymentRequestStatus.PENDING_APPROVAL
        audit_services.log_approval_invalidated(
            locked_request,
            actor=actor,
            reason="Material payment amount change.",
        )

    locked_request.save()
    return locked_request


def get_approval_queue(
    user: UserAccount | Any,
    *,
    tier: str | None = None,
) -> QuerySet[PaymentRequest]:
    """Retrieve payment requests awaiting approval that the user can act on.

    Filters out self-authored requests and matches user role against
    pending approval requirements.
    """
    if not getattr(user, "is_authenticated", False) or not getattr(
        user, "is_active", False
    ):
        return PaymentRequest.objects.none()

    threshold = get_approval_threshold()
    base_qs = (
        PaymentRequest.objects.filter(
            status__in=[
                PaymentRequestStatus.PENDING_APPROVAL,
                PaymentRequestStatus.SUBMITTED,
            ],
            is_active=True,
        )
        .exclude(Q(requester_id=user.id) | Q(created_by=user.id))
        .select_related("vendor", "project", "requester")
    )

    role = getattr(user, "role", None)
    is_super = getattr(user, "is_superuser", False)

    if is_super or role == UserRole.ADMINISTRATOR:
        if tier == ApprovalTier.MANAGER:
            return base_qs.exclude(
                approvals__tier=ApprovalTier.MANAGER,
                approvals__decision=ApprovalDecision.APPROVED,
            )
        if tier == ApprovalTier.FINANCE:
            return base_qs.filter(amount__gt=threshold).exclude(
                approvals__tier=ApprovalTier.FINANCE,
                approvals__decision=ApprovalDecision.APPROVED,
            )
        return base_qs

    if role == UserRole.MANAGER:
        return base_qs.exclude(
            approvals__tier=ApprovalTier.MANAGER,
            approvals__decision=ApprovalDecision.APPROVED,
        )

    if role == UserRole.FINANCE_OFFICER:
        return base_qs.filter(amount__gt=threshold).exclude(
            approvals__tier=ApprovalTier.FINANCE,
            approvals__decision=ApprovalDecision.APPROVED,
        )

    return PaymentRequest.objects.none()


def get_approval_history(payment_request: PaymentRequest) -> list[dict[str, Any]]:
    """Return serialized audit history of approval decisions for a request."""
    approvals = get_recorded_approvals(payment_request)
    return [
        {
            "id": str(appr.id),
            "tier": appr.tier,
            "decision": appr.decision,
            "reason": appr.reason,
            "approver_id": str(appr.approver_id),
            "approver_name": getattr(appr.approver, "get_full_name", lambda: "")()
            or appr.approver.username,
            "approver_role": getattr(appr.approver, "role", None),
            "created_at": appr.created_at.isoformat() if appr.created_at else None,
        }
        for appr in approvals
    ]
