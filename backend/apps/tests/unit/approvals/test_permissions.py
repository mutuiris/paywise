from decimal import Decimal

from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.approvals.models import ApprovalTier
from apps.approvals.permissions import (
    can_approve_finance_tier,
    can_approve_manager_tier,
    can_approve_request,
    can_reject_request,
    check_can_approve_request,
    check_can_reject_request,
)
from apps.payments.models import PaymentRequest
from apps.vendors.models import Vendor


class ApprovalPermissionsTestCase(TestCase):
    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="perm_emp",
            role=UserRole.EMPLOYEE,
        )
        self.manager = UserAccount.objects.create_user(
            username="perm_mgr",
            role=UserRole.MANAGER,
        )
        self.finance = UserAccount.objects.create_user(
            username="perm_fin",
            role=UserRole.FINANCE_OFFICER,
        )
        self.admin = UserAccount.objects.create_user(
            username="perm_admin",
            role=UserRole.ADMINISTRATOR,
        )
        self.superuser = UserAccount.objects.create_superuser(
            username="perm_super",
            email="super@example.com",
            password="password123",
        )
        self.inactive_mgr = UserAccount.objects.create_user(
            username="perm_inactive_mgr",
            role=UserRole.MANAGER,
            is_active=False,
        )
        self.vendor = Vendor.objects.create(name="Vendor Perms Test")
        self.payment_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("30000.00"),
            invoice_number="INV-PERM-01",
            description="Office hardware",
            created_by=self.employee.id,
        )

    def test_anonymous_and_inactive_users_cannot_approve(self) -> None:
        anon = AnonymousUser()
        self.assertFalse(can_approve_manager_tier(anon))
        self.assertFalse(can_approve_finance_tier(anon))
        self.assertFalse(can_approve_request(anon, self.payment_req))
        self.assertFalse(can_reject_request(anon, self.payment_req))

        self.assertFalse(can_approve_manager_tier(self.inactive_mgr))
        self.assertFalse(can_approve_finance_tier(self.inactive_mgr))
        self.assertFalse(can_approve_request(self.inactive_mgr, self.payment_req))

    def test_tier_permission_predicates(self) -> None:
        self.assertFalse(can_approve_manager_tier(self.employee))
        self.assertTrue(can_approve_manager_tier(self.manager))
        self.assertFalse(can_approve_manager_tier(self.finance))
        self.assertTrue(can_approve_manager_tier(self.admin))
        self.assertTrue(can_approve_manager_tier(self.superuser))

        self.assertFalse(can_approve_finance_tier(self.employee))
        self.assertFalse(can_approve_finance_tier(self.manager))
        self.assertTrue(can_approve_finance_tier(self.finance))
        self.assertTrue(can_approve_finance_tier(self.admin))
        self.assertTrue(can_approve_finance_tier(self.superuser))

    def test_self_approval_prevented_for_requester_and_creator(self) -> None:
        # If manager is the requester, manager cannot approve
        mgr_payment = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.manager,
            amount=Decimal("25000.00"),
            invoice_number="INV-MGR-01",
            description="Manager laptop",
            created_by=self.manager.id,
        )
        self.assertFalse(can_approve_request(self.manager, mgr_payment))
        self.assertFalse(can_reject_request(self.manager, mgr_payment))

        with self.assertRaises(PermissionDenied):
            check_can_approve_request(
                self.manager, mgr_payment, tier=ApprovalTier.MANAGER
            )

        with self.assertRaises(PermissionDenied):
            check_can_reject_request(self.manager, mgr_payment)

    def test_check_guards_raise_permission_denied_for_employee(self) -> None:
        with self.assertRaises(PermissionDenied):
            check_can_approve_request(
                self.employee, self.payment_req, tier=ApprovalTier.MANAGER
            )

        with self.assertRaises(PermissionDenied):
            check_can_reject_request(self.employee, self.payment_req)
