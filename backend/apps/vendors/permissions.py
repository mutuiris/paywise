from __future__ import annotations

from typing import TYPE_CHECKING

from django.core.exceptions import PermissionDenied

from apps.accounts.models import UserRole

if TYPE_CHECKING:
    from django.contrib.auth.models import AnonymousUser

    from apps.accounts.models import UserAccount


def is_active_authenticated_user(user: UserAccount | AnonymousUser | None) -> bool:
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    return bool(getattr(user, "is_active", False))


def can_view_vendors(user: UserAccount | AnonymousUser | None) -> bool:
    """All active authenticated users can view active vendors."""
    return is_active_authenticated_user(user)


def can_manage_vendors(user: UserAccount | AnonymousUser | None) -> bool:
    """Finance Officers and Administrators can manage vendors and payment details."""
    if not is_active_authenticated_user(user):
        return False
    if getattr(user, "is_superuser", False):
        return True
    role = getattr(user, "role", None)
    return role in (UserRole.FINANCE_OFFICER, UserRole.ADMINISTRATOR)


def can_view_projects(user: UserAccount | AnonymousUser | None) -> bool:
    """All active authenticated users can view active projects."""
    return is_active_authenticated_user(user)


def can_manage_projects(user: UserAccount | AnonymousUser | None) -> bool:
    """Only Managers and Administrators can manage projects and departments."""
    if not is_active_authenticated_user(user):
        return False
    if getattr(user, "is_superuser", False):
        return True
    role = getattr(user, "role", None)
    return role in (UserRole.MANAGER, UserRole.ADMINISTRATOR)


def check_can_view_vendors(user: UserAccount | AnonymousUser | None) -> None:
    if not can_view_vendors(user):
        raise PermissionDenied("Authentication required to view vendors.")


def check_can_manage_vendors(user: UserAccount | AnonymousUser | None) -> None:
    if not can_manage_vendors(user):
        raise PermissionDenied(
            "Only Finance Officers and Administrators can manage vendors."
        )


def check_can_view_projects(user: UserAccount | AnonymousUser | None) -> None:
    if not can_view_projects(user):
        raise PermissionDenied("Authentication required to view projects.")


def check_can_manage_projects(user: UserAccount | AnonymousUser | None) -> None:
    if not can_manage_projects(user):
        raise PermissionDenied("Only Managers and Administrators can manage projects.")
