from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.audit.permissions import (
    can_view_audit_events,
    check_can_view_audit_events,
)


class AuditPermissionsTestCase(TestCase):
    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="audit_perm_emp",
            role=UserRole.EMPLOYEE,
        )
        self.manager = UserAccount.objects.create_user(
            username="audit_perm_mgr",
            role=UserRole.MANAGER,
        )
        self.finance = UserAccount.objects.create_user(
            username="audit_perm_fin",
            role=UserRole.FINANCE_OFFICER,
        )
        self.admin = UserAccount.objects.create_user(
            username="audit_perm_admin",
            role=UserRole.ADMINISTRATOR,
        )
        self.superuser = UserAccount.objects.create_superuser(
            username="audit_perm_super",
            email="super@paywise.co.ke",
            password="password123",
        )
        self.inactive_user = UserAccount.objects.create_user(
            username="audit_perm_inactive",
            role=UserRole.MANAGER,
            is_active=False,
        )

    def test_anonymous_and_inactive_users_blocked(self) -> None:
        anon = AnonymousUser()
        self.assertFalse(can_view_audit_events(anon))
        with self.assertRaises(PermissionDenied):
            check_can_view_audit_events(anon)

        self.assertFalse(can_view_audit_events(self.inactive_user))
        with self.assertRaises(PermissionDenied):
            check_can_view_audit_events(self.inactive_user)

    def test_employee_cannot_view_audit_events(self) -> None:
        self.assertFalse(can_view_audit_events(self.employee))
        with self.assertRaises(PermissionDenied):
            check_can_view_audit_events(self.employee)

    def test_privileged_roles_can_view_audit_events(self) -> None:
        self.assertTrue(can_view_audit_events(self.manager))
        self.assertTrue(can_view_audit_events(self.finance))
        self.assertTrue(can_view_audit_events(self.admin))
        self.assertTrue(can_view_audit_events(self.superuser))
