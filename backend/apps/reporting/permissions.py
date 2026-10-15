"""Role-based access permissions for financial and executive reporting."""

from __future__ import annotations

from typing import TYPE_CHECKING

from django.core.exceptions import PermissionDenied

from apps.accounts.models import UserRole

if TYPE_CHECKING:
    from django.contrib.auth.models import AnonymousUser

    from apps.accounts.models import UserAccount


def is_active_authenticated_user(user: UserAccount | AnonymousUser | None) -> bool:
    """Verify that the user is authenticated and marked active."""
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    return bool(getattr(user, "is_active", False))


def can_view_reports(user: UserAccount | AnonymousUser | None) -> bool:
    """Finance Officers, Managers, and Administrators can access financial reports."""
    if not is_active_authenticated_user(user):
        return False
    if getattr(user, "is_superuser", False):
        return True
    role = getattr(user, "role", None)
    return role in (UserRole.FINANCE_OFFICER, UserRole.MANAGER, UserRole.ADMINISTRATOR)


def check_can_view_reports(user: UserAccount | AnonymousUser | None) -> None:
    """Raise PermissionDenied if user does not possess reporting view privileges."""
    if not is_active_authenticated_user(user):
        raise PermissionDenied("Authentication required to view payment reports.")
    if not can_view_reports(user):
        raise PermissionDenied(
            "Only Managers, Finance Officers, and Administrators can view reports."
        )
