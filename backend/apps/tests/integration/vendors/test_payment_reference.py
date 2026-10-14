from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db.models import ProtectedError
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.payments.models import PaymentMethod, PaymentRequest, PaymentRequestStatus
from apps.vendors.models import Project, Vendor


class PaymentVendorProjectReferenceIntegrationTestCase(TestCase):
    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="emp_ref", role=UserRole.EMPLOYEE
        )
        self.vendor = Vendor.objects.create(
            name="Imara Concrete Ltd.",
            service_category="Ready mix concrete",
            payment_details={"paybill": "998877", "account": "CONCRETE"},
        )
        self.inactive_vendor = Vendor.objects.create(
            name="Bankrupt Logistics",
            is_active=False,
        )
        self.project = Project.objects.create(
            name="Nairobi Expressway Toll Plaza",
            code="PRJ-EXP-01",
            department="Civil Infrastructure",
        )
        self.inactive_project = Project.objects.create(
            name="Shelved Stadium Phase",
            is_active=False,
        )

    def test_payment_request_references_vendor_and_project(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project,
            requester=self.employee,
            amount=Decimal("45000.00"),
            invoice_number="INV-CONC-101",
            description="Concrete foundation pouring",
            payment_method=PaymentMethod.MPESA,
            status=PaymentRequestStatus.SUBMITTED,
        )
        self.assertEqual(req.vendor, self.vendor)
        self.assertEqual(req.project, self.project)
        self.assertEqual(req.requester, self.employee)

        # Verify reverse relationships
        self.assertIn(req, self.vendor.payment_requests.all())
        self.assertIn(req, self.project.payment_requests.all())

    def test_payment_request_references_vendor_without_project(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=None,
            requester=self.employee,
            amount=Decimal("12000.00"),
            invoice_number="INV-CONC-102",
            description="General office concrete maintenance",
            payment_method=PaymentMethod.MPESA,
        )
        self.assertEqual(req.vendor, self.vendor)
        self.assertIsNone(req.project)
        self.assertIn(req, self.vendor.payment_requests.all())

    def test_payment_request_fails_with_inactive_vendor(self) -> None:
        with self.assertRaises(ValidationError) as ctx:
            PaymentRequest.objects.create(
                vendor=self.inactive_vendor,
                project=self.project,
                requester=self.employee,
                amount=Decimal("50000.00"),
                invoice_number="INV-FAIL-01",
                description="Attempt with inactive vendor",
            )
        self.assertIn("vendor", ctx.exception.message_dict)

    def test_payment_request_fails_with_inactive_project(self) -> None:
        with self.assertRaises(ValidationError) as ctx:
            PaymentRequest.objects.create(
                vendor=self.vendor,
                project=self.inactive_project,
                requester=self.employee,
                amount=Decimal("50000.00"),
                invoice_number="INV-FAIL-02",
                description="Attempt with inactive project",
            )
        self.assertIn("project", ctx.exception.message_dict)

    def test_vendor_deletion_protected_when_referenced(self) -> None:
        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project,
            requester=self.employee,
            amount=Decimal("30000.00"),
            invoice_number="INV-PROT-01",
            description="Structural pillars",
        )
        with self.assertRaises(ProtectedError):
            self.vendor.delete()

    def test_project_deletion_protected_when_referenced(self) -> None:
        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project,
            requester=self.employee,
            amount=Decimal("30000.00"),
            invoice_number="INV-PROT-02",
            description="Bridge abutments",
        )
        with self.assertRaises(ProtectedError):
            self.project.delete()
