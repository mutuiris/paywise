from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.vendors.permissions import (
    can_manage_projects,
    can_manage_vendors,
    can_view_projects,
    can_view_vendors,
    check_can_manage_projects,
    check_can_manage_vendors,
    check_can_view_projects,
    check_can_view_vendors,
)


class VendorAndProjectPermissionsTestCase(TestCase):
    def setUp(self) -> None:
        self.anonymous = AnonymousUser()
        self.employee = UserAccount.objects.create_user(
            username="emp1", role=UserRole.EMPLOYEE
        )
        self.manager = UserAccount.objects.create_user(
            username="mgr1", role=UserRole.MANAGER
        )
        self.finance = UserAccount.objects.create_user(
            username="fin1", role=UserRole.FINANCE_OFFICER
        )
        self.admin = UserAccount.objects.create_user(
            username="adm1", role=UserRole.ADMINISTRATOR
        )
        self.superuser = UserAccount.objects.create_superuser(
            username="super1", role=UserRole.ADMINISTRATOR
        )
        self.inactive_user = UserAccount.objects.create_user(
            username="inact1", role=UserRole.ADMINISTRATOR, is_active=False
        )

    def test_anonymous_user_permissions(self) -> None:
        self.assertFalse(can_view_vendors(self.anonymous))
        self.assertFalse(can_manage_vendors(self.anonymous))
        self.assertFalse(can_view_projects(self.anonymous))
        self.assertFalse(can_manage_projects(self.anonymous))

        with self.assertRaises(PermissionDenied):
            check_can_view_vendors(self.anonymous)
        with self.assertRaises(PermissionDenied):
            check_can_manage_vendors(self.anonymous)
        with self.assertRaises(PermissionDenied):
            check_can_view_projects(self.anonymous)
        with self.assertRaises(PermissionDenied):
            check_can_manage_projects(self.anonymous)

    def test_inactive_user_permissions(self) -> None:
        self.assertFalse(can_view_vendors(self.inactive_user))
        self.assertFalse(can_manage_vendors(self.inactive_user))
        self.assertFalse(can_view_projects(self.inactive_user))
        self.assertFalse(can_manage_projects(self.inactive_user))

    def test_employee_permissions(self) -> None:
        self.assertTrue(can_view_vendors(self.employee))
        self.assertFalse(can_manage_vendors(self.employee))
        self.assertTrue(can_view_projects(self.employee))
        self.assertFalse(can_manage_projects(self.employee))

        with self.assertRaises(PermissionDenied):
            check_can_manage_vendors(self.employee)
        with self.assertRaises(PermissionDenied):
            check_can_manage_projects(self.employee)

    def test_manager_permissions(self) -> None:
        self.assertTrue(can_view_vendors(self.manager))
        self.assertFalse(can_manage_vendors(self.manager))
        self.assertTrue(can_view_projects(self.manager))
        self.assertTrue(can_manage_projects(self.manager))

        with self.assertRaises(PermissionDenied):
            check_can_manage_vendors(self.manager)
        # Managing projects should not raise
        check_can_manage_projects(self.manager)

    def test_finance_officer_permissions(self) -> None:
        self.assertTrue(can_view_vendors(self.finance))
        self.assertTrue(can_manage_vendors(self.finance))
        self.assertTrue(can_view_projects(self.finance))
        self.assertFalse(can_manage_projects(self.finance))

        check_can_manage_vendors(self.finance)
        with self.assertRaises(PermissionDenied):
            check_can_manage_projects(self.finance)

    def test_administrator_permissions(self) -> None:
        self.assertTrue(can_view_vendors(self.admin))
        self.assertTrue(can_manage_vendors(self.admin))
        self.assertTrue(can_view_projects(self.admin))
        self.assertTrue(can_manage_projects(self.admin))

        check_can_manage_vendors(self.admin)
        check_can_manage_projects(self.admin)

    def test_superuser_permissions(self) -> None:
        self.assertTrue(can_view_vendors(self.superuser))
        self.assertTrue(can_manage_vendors(self.superuser))
        self.assertTrue(can_view_projects(self.superuser))
        self.assertTrue(can_manage_projects(self.superuser))
