"""Application services orchestrating approval policies and decisions."""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING, Any

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q, QuerySet

from apps.accounts.models import UserRole
from apps.approvals.models import Approval, ApprovalDecision, ApprovalTier
from apps.approvals.permissions import (
    can_approve_finance_tier,
    can_approve_manager_tier,
    check_can_approve_request,
    check_can_reject_request,
)
from apps.payments.models import PaymentRequest, PaymentRequestStatus

if TYPE_CHECKING:
    from apps.accounts.models import UserAccount

# Dual-approval financial threshold specified in case study and architecture plan
APPROVAL_THRESHOLD = Decimal("50000.00")


def get_required_tiers(payment_request: PaymentRequest) -> list[str]:
    """Calculate the required approval tiers based on payment amount.

    Payments of KES 50,000 or less require Manager approval only.
    Payments exceeding KES 50,000 require both Manager and Finance sign-off.
    """
    if payment_request.amount <= APPROVAL_THRESHOLD:
        return [ApprovalTier.MANAGER]
    return [ApprovalTier.MANAGER, ApprovalTier.FINANCE]


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
    approver: UserAccount,
    tier: str | None = None,
    decision: str = ApprovalDecision.APPROVED,
    reason: str = "",
) -> Approval:
    """Record an approval or rejection decision and transition request state.

    Enforces:
    1. Requesters cannot approve their own requests (self-approval ban).
    2. Threshold policy: <= 50k requires Manager; > 50k requires Mgr + Finance.
    3. Mandatory non-empty reason on rejection.
    4. State transitions: full approval moves to APPROVED; rejection to REJECTED.
    """
    # Reject modifications to completed or already rejected requests
    if payment_request.status == PaymentRequestStatus.REJECTED:
        raise ValidationError(
            {
                "payment_request": (
                    "Cannot approve or reject an already rejected payment request."
                )
            }
        )
    if (
        payment_request.status == PaymentRequestStatus.APPROVED
        and decision == ApprovalDecision.APPROVED
    ):
        raise ValidationError(
            {"payment_request": "Payment request has already been fully approved."}
        )
    if payment_request.status not in (
        PaymentRequestStatus.PENDING_APPROVAL,
        PaymentRequestStatus.SUBMITTED,
        PaymentRequestStatus.APPROVED,
    ):
        raise ValidationError(
            {
                "payment_request": (
                    f"Cannot decide on payment request in "
                    f"'{payment_request.status}' state."
                )
            }
        )

    # Verify authorization guards first
    if decision == ApprovalDecision.REJECTED:
        check_can_reject_request(approver, payment_request)
        if not reason or not reason.strip():
            raise ValidationError(
                {"reason": "A reason is mandatory when rejecting a payment request."}
            )
    else:
        check_can_approve_request(approver, payment_request, tier=tier)

    # Infer tier from approver role if not explicitly provided
    if tier is None:
        role = getattr(approver, "role", None)
        pending = get_pending_tiers(payment_request)
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

    # Re-verify specific tier permission once resolved
    if decision != ApprovalDecision.REJECTED:
        check_can_approve_request(approver, payment_request, tier=tier)

    required_tiers = get_required_tiers(payment_request)
    if tier not in required_tiers:
        raise ValidationError(
            {
                "tier": (
                    f"Tier '{tier}' is not required for request amount of "
                    f"{payment_request.amount} {payment_request.currency}."
                )
            }
        )

    # Check whether this tier was already approved
    if decision == ApprovalDecision.APPROVED and tier in get_approved_tiers(
        payment_request
    ):
        raise ValidationError(
            {
                "tier": (
                    f"Tier '{tier}' has already been approved for this payment request."
                )
            }
        )

    # Create and validate domain model instance
    approval = Approval(
        payment_request=payment_request,
        approver=approver,
        tier=tier,
        decision=decision,
        reason=reason.strip(),
        created_by=approver.id,
        updated_by=approver.id,
    )
    approval.save()

    # Synchronize PaymentRequest lifecycle state
    if decision == ApprovalDecision.REJECTED:
        payment_request.status = PaymentRequestStatus.REJECTED
        payment_request.rejection_reason = reason.strip()
        payment_request.updated_by = approver.id
        payment_request.save(
            update_fields=["status", "rejection_reason", "updated_by", "updated_at"]
        )
    elif decision == ApprovalDecision.APPROVED:
        if is_fully_approved(payment_request):
            payment_request.status = PaymentRequestStatus.APPROVED
            payment_request.updated_by = approver.id
            payment_request.save(update_fields=["status", "updated_by", "updated_at"])
        else:
            # Multi-tier workflow: stay PENDING_APPROVAL until all tiers approve
            if payment_request.status != PaymentRequestStatus.PENDING_APPROVAL:
                payment_request.status = PaymentRequestStatus.PENDING_APPROVAL
                payment_request.updated_by = approver.id
                payment_request.save(
                    update_fields=["status", "updated_by", "updated_at"]
                )

    return approval


def get_approval_queue(
    user: UserAccount,
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

    # Base query: active requests awaiting approval, excluding self-authored
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
        elif tier == ApprovalTier.FINANCE:
            return base_qs.filter(amount__gt=APPROVAL_THRESHOLD).exclude(
                approvals__tier=ApprovalTier.FINANCE,
                approvals__decision=ApprovalDecision.APPROVED,
            )
        return base_qs

    if role == UserRole.MANAGER:
        # Managers act on Manager tier approvals not yet approved
        return base_qs.exclude(
            approvals__tier=ApprovalTier.MANAGER,
            approvals__decision=ApprovalDecision.APPROVED,
        )

    if role == UserRole.FINANCE_OFFICER:
        # Finance officers act on Finance tier approvals for requests > 50,000
        return base_qs.filter(amount__gt=APPROVAL_THRESHOLD).exclude(
            approvals__tier=ApprovalTier.FINANCE,
            approvals__decision=ApprovalDecision.APPROVED,
        )

    # Standard employees have no approval authority
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
