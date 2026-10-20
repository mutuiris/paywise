"""Role-based permission guards for payment requests and search queries."""

from __future__ import annotations

from typing import TYPE_CHECKING

from django.core.exceptions import PermissionDenied

from apps.accounts.models import UserRole

if TYPE_CHECKING:
    from django.contrib.auth.models import AnonymousUser

    from apps.accounts.models import UserAccount
    from apps.payments.models import PaymentRequest


def is_active_authenticated_user(user: UserAccount | AnonymousUser | None) -> bool:
    """Verify that the user is authenticated and marked active."""
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    return bool(getattr(user, "is_active", False))


def can_view_all_payments(user: UserAccount | AnonymousUser | None) -> bool:
    """Finance Officers, Managers, and Administrators can view all payment requests."""
    if not is_active_authenticated_user(user):
        return False
    if getattr(user, "is_superuser", False):
        return True
    role = getattr(user, "role", None)
    return role in (UserRole.FINANCE_OFFICER, UserRole.MANAGER, UserRole.ADMINISTRATOR)


def can_view_payment_request(
    user: UserAccount | AnonymousUser | None,
    payment_request: PaymentRequest,
) -> bool:
    """Determine whether a user is permitted to view a specific payment request.

    Finance officers, managers, and administrators can view any request.
    Employees can only view requests that they created or requested.
    """
    if not is_active_authenticated_user(user):
        return False
    if can_view_all_payments(user):
        return True

    user_id = getattr(user, "id", None)
    if user_id:
        if getattr(payment_request, "requester_id", None) == user_id:
            return True
        if getattr(payment_request, "created_by", None) == user_id:
            return True
    return False


def check_can_view_payment_request(
    user: UserAccount | AnonymousUser | None,
    payment_request: PaymentRequest,
) -> None:
    """Raise PermissionDenied if the user cannot view the payment request."""
    if not is_active_authenticated_user(user):
        raise PermissionDenied("Authentication required to view payment requests.")
    if not can_view_payment_request(user, payment_request):
        raise PermissionDenied(
            "You do not have permission to view this payment request."
        )
