"""Unit tests for reporting role-based access permissions."""

from __future__ import annotations

from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.reporting.permissions import (
    can_view_reports,
    check_can_view_reports,
    is_active_authenticated_user,
)


class ReportingPermissionsUnitTests(TestCase):
    """Unit tests for reporting authorization predicates and guards."""

    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="employee_rep",
            role=UserRole.EMPLOYEE,
        )
        self.manager = UserAccount.objects.create_user(
            username="manager_rep",
            role=UserRole.MANAGER,
        )
        self.finance = UserAccount.objects.create_user(
            username="finance_rep",
            role=UserRole.FINANCE_OFFICER,
        )
        self.admin = UserAccount.objects.create_user(
            username="admin_rep",
            role=UserRole.ADMINISTRATOR,
        )
        self.inactive = UserAccount.objects.create_user(
            username="inactive_rep",
            role=UserRole.FINANCE_OFFICER,
            is_active=False,
        )

    def test_anonymous_and_inactive_users_denied(self) -> None:
        """Anonymous or inactive users cannot access reports."""
        anon = AnonymousUser()
        self.assertFalse(is_active_authenticated_user(anon))
        self.assertFalse(can_view_reports(anon))

        self.assertFalse(is_active_authenticated_user(self.inactive))
        self.assertFalse(can_view_reports(self.inactive))

    def test_employee_cannot_view_reports(self) -> None:
        """Employees do not possess permission to view financial reports."""
        self.assertTrue(is_active_authenticated_user(self.employee))
        self.assertFalse(can_view_reports(self.employee))
        with self.assertRaises(PermissionDenied):
            check_can_view_reports(self.employee)

    def test_manager_finance_and_admin_can_view_reports(self) -> None:
        """Management and Finance roles have access to reporting."""
        for user in (self.manager, self.finance, self.admin):
            self.assertTrue(can_view_reports(user))
            # Should not raise exception
            check_can_view_reports(user)

    def test_superuser_can_view_reports(self) -> None:
        """Superusers possess reporting view privileges."""
        super_user = UserAccount.objects.create_superuser(
            username="rep_super",
            email="super@paywise.co.ke",
            password="pass",
        )
        self.assertTrue(can_view_reports(super_user))
        check_can_view_reports(super_user)
