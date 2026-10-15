"""Role-based permission rules and access guards for the approvals domain."""

from __future__ import annotations

from typing import TYPE_CHECKING

from django.core.exceptions import PermissionDenied

from apps.accounts.models import UserRole
from apps.approvals.models import ApprovalTier

if TYPE_CHECKING:
    from django.contrib.auth.models import AnonymousUser

    from apps.accounts.models import UserAccount
    from apps.payments.models import PaymentRequest


def is_active_authenticated_user(user: UserAccount | AnonymousUser | None) -> bool:
    """Verify that the user is authenticated and marked active."""
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    return bool(getattr(user, "is_active", False))


def can_view_approvals(user: UserAccount | AnonymousUser | None) -> bool:
    """Active authenticated users can view approvals relevant to them."""
    return is_active_authenticated_user(user)


def can_approve_manager_tier(user: UserAccount | AnonymousUser | None) -> bool:
    """Managers, Administrators, and Superusers can grant Manager tier approval."""
    if not is_active_authenticated_user(user):
        return False
    if getattr(user, "is_superuser", False):
        return True
    role = getattr(user, "role", None)
    return role in (UserRole.MANAGER, UserRole.ADMINISTRATOR)


def can_approve_finance_tier(user: UserAccount | AnonymousUser | None) -> bool:
    """Finance Officers and Admins can grant Finance tier approval."""
    if not is_active_authenticated_user(user):
        return False
    if getattr(user, "is_superuser", False):
        return True
    role = getattr(user, "role", None)
    return role in (UserRole.FINANCE_OFFICER, UserRole.ADMINISTRATOR)


def can_approve_request(
    user: UserAccount | AnonymousUser | None,
    payment_request: PaymentRequest,
    tier: str | None = None,
) -> bool:
    """Determine whether the user is permitted to record an approval.

    Enforces the self-approval ban and validates that the user possesses
    the requisite role for the tier.
    """
    if not is_active_authenticated_user(user):
        return False

    # Enforce strict separation of duties: requesters/creators cannot approve
    user_id = getattr(user, "id", None)
    if user_id:
        if getattr(payment_request, "requester_id", None) == user_id:
            return False
        if getattr(payment_request, "created_by", None) == user_id:
            return False

    if tier == ApprovalTier.MANAGER:
        return can_approve_manager_tier(user)
    elif tier == ApprovalTier.FINANCE:
        return can_approve_finance_tier(user)
    elif tier is None:
        return can_approve_manager_tier(user) or can_approve_finance_tier(user)

    return False


def can_reject_request(
    user: UserAccount | AnonymousUser | None,
    payment_request: PaymentRequest,
) -> bool:
    """Determine whether the user is permitted to reject the payment request.

    Managers, Finance Officers, and Administrators can reject, provided they
    are not the requester or creator of the request.
    """
    if not is_active_authenticated_user(user):
        return False

    user_id = getattr(user, "id", None)
    if user_id:
        if getattr(payment_request, "requester_id", None) == user_id:
            return False
        if getattr(payment_request, "created_by", None) == user_id:
            return False

    if getattr(user, "is_superuser", False):
        return True

    role = getattr(user, "role", None)
    return role in (UserRole.MANAGER, UserRole.FINANCE_OFFICER, UserRole.ADMINISTRATOR)


def check_can_view_approvals(user: UserAccount | AnonymousUser | None) -> None:
    """Raise PermissionDenied if user cannot view approvals."""
    if not can_view_approvals(user):
        raise PermissionDenied("Authentication required to view approvals.")


def check_can_approve_request(
    user: UserAccount | AnonymousUser | None,
    payment_request: PaymentRequest,
    tier: str | None = None,
) -> None:
    """Raise PermissionDenied if user is not authorized to approve the request."""
    if not is_active_authenticated_user(user):
        raise PermissionDenied("Authentication required to record approvals.")

    user_id = getattr(user, "id", None)
    if user_id:
        if getattr(payment_request, "requester_id", None) == user_id:
            raise PermissionDenied(
                "Requesters cannot approve their own payment requests."
            )
        if getattr(payment_request, "created_by", None) == user_id:
            raise PermissionDenied(
                "Requesters cannot approve their own payment requests."
            )

    if tier == ApprovalTier.MANAGER and not can_approve_manager_tier(user):
        raise PermissionDenied(
            "Only Managers and Administrators can grant Manager tier approval."
        )
    if tier == ApprovalTier.FINANCE and not can_approve_finance_tier(user):
        raise PermissionDenied(
            "Only Finance Officers and Administrators can grant Finance tier approval."
        )
    if tier is None and not (
        can_approve_manager_tier(user) or can_approve_finance_tier(user)
    ):
        raise PermissionDenied(
            "Only Managers, Finance Officers, or Administrators can approve requests."
        )


def check_can_reject_request(
    user: UserAccount | AnonymousUser | None,
    payment_request: PaymentRequest,
) -> None:
    """Raise PermissionDenied if user is not authorized to reject the request."""
    if not is_active_authenticated_user(user):
        raise PermissionDenied("Authentication required to reject payment requests.")

    user_id = getattr(user, "id", None)
    if user_id:
        if getattr(payment_request, "requester_id", None) == user_id:
            raise PermissionDenied(
                "Requesters cannot reject their own payment requests."
            )
        if getattr(payment_request, "created_by", None) == user_id:
            raise PermissionDenied(
                "Requesters cannot reject their own payment requests."
            )

    if not can_reject_request(user, payment_request):
        raise PermissionDenied(
            "Only Managers, Finance Officers, or Administrators can reject requests."
        )
