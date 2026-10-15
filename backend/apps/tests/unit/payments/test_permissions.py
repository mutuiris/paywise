"""Unit tests for payment domain role-based permissions and access guards."""

from __future__ import annotations

from decimal import Decimal

from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.payments.models import PaymentRequest
from apps.payments.permissions import (
    can_view_all_payments,
    can_view_payment_request,
    check_can_view_payment_request,
    is_active_authenticated_user,
)
from apps.vendors.models import Vendor


class PaymentPermissionsUnitTests(TestCase):
    """Unit tests for payment permission functions and exception guards."""

    def setUp(self) -> None:
        self.employee1 = UserAccount.objects.create_user(
            username="pemp1",
            role=UserRole.EMPLOYEE,
        )
        self.employee2 = UserAccount.objects.create_user(
            username="pemp2",
            role=UserRole.EMPLOYEE,
        )
        self.manager = UserAccount.objects.create_user(
            username="pmgr",
            role=UserRole.MANAGER,
        )
        self.finance = UserAccount.objects.create_user(
            username="pfin",
            role=UserRole.FINANCE_OFFICER,
        )
        self.admin = UserAccount.objects.create_user(
            username="padmin",
            role=UserRole.ADMINISTRATOR,
        )
        self.superuser = UserAccount.objects.create_superuser(
            username="psuper",
            email="psuper@example.com",
            password="password123",
        )
        self.inactive_user = UserAccount.objects.create_user(
            username="pinactive",
            role=UserRole.FINANCE_OFFICER,
            is_active=False,
        )

        self.vendor = Vendor.objects.create(name="Perm Vendor Ltd")
        self.req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee1,
            created_by=self.employee1.id,
            amount=Decimal("15000.00"),
            invoice_number="INV-PERM-PAY-01",
            description="Office chairs",
        )

    def test_is_active_authenticated_user(self) -> None:
        """Verifies active authenticated state checks."""
        self.assertFalse(is_active_authenticated_user(None))
        self.assertFalse(is_active_authenticated_user(AnonymousUser()))
        self.assertFalse(is_active_authenticated_user(self.inactive_user))
        self.assertTrue(is_active_authenticated_user(self.employee1))

    def test_can_view_all_payments(self) -> None:
        """Verifies global payment viewing predicates across roles."""
        self.assertFalse(can_view_all_payments(None))
        self.assertFalse(can_view_all_payments(self.employee1))
        self.assertFalse(can_view_all_payments(self.inactive_user))

        self.assertTrue(can_view_all_payments(self.manager))
        self.assertTrue(can_view_all_payments(self.finance))
        self.assertTrue(can_view_all_payments(self.admin))
        self.assertTrue(can_view_all_payments(self.superuser))

    def test_can_view_payment_request(self) -> None:
        """Verifies single request visibility rules."""
        self.assertFalse(can_view_payment_request(None, self.req))
        self.assertFalse(can_view_payment_request(self.employee2, self.req))

        self.assertTrue(can_view_payment_request(self.employee1, self.req))
        self.assertTrue(can_view_payment_request(self.finance, self.req))
        self.assertTrue(can_view_payment_request(self.manager, self.req))
        self.assertTrue(can_view_payment_request(self.admin, self.req))

    def test_check_can_view_payment_request_guard(self) -> None:
        """Verifies exception raising on unauthorized view access."""
        check_can_view_payment_request(self.employee1, self.req)
        check_can_view_payment_request(self.finance, self.req)

        with self.assertRaises(PermissionDenied):
            check_can_view_payment_request(None, self.req)

        with self.assertRaises(PermissionDenied):
            check_can_view_payment_request(self.employee2, self.req)
