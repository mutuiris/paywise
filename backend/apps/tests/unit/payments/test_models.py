import uuid
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.test import TestCase

from apps.accounts.models import UserAccount
from apps.payments.models import (
    PaymentAttempt,
    PaymentAttemptStatus,
    PaymentMethod,
    PaymentRequest,
    PaymentRequestStatus,
)
from apps.vendors.models import Project, Vendor


class PaymentRequestModelTestCase(TestCase):
    def setUp(self) -> None:
        self.user = UserAccount.objects.create_user(username="requester1")
        self.vendor = Vendor.objects.create(name="Apex Electricals")
        self.project = Project.objects.create(name="Kilimani Apartments")

    def test_create_payment_request(self) -> None:
        payment = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project,
            requester=self.user,
            amount=Decimal("84500.00"),
            invoice_number="INV-2043",
            description="Electrical materials delivered to Westlands",
            payment_method=PaymentMethod.MPESA,
            created_by=self.user.id,
        )
        self.assertIsInstance(payment.id, uuid.UUID)
        self.assertEqual(payment.status, PaymentRequestStatus.DRAFT)
        self.assertEqual(payment.currency, "KES")
        self.assertEqual(payment.history.count(), 1)
        self.assertIn("INV-2043", str(payment))

    def test_unique_vendor_invoice_number_constraint(self) -> None:
        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project,
            requester=self.user,
            amount=Decimal("10000.00"),
            invoice_number="INV-DUP-01",
            description="First submission",
        )
        with self.assertRaises((IntegrityError, ValidationError)):
            PaymentRequest.objects.create(
                vendor=self.vendor,
                project=self.project,
                requester=self.user,
                amount=Decimal("10000.00"),
                invoice_number="INV-DUP-01",
                description="Duplicate submission attempt",
            )

    def test_different_vendors_same_invoice_number_allowed(self) -> None:
        other_vendor = Vendor.objects.create(name="SwiftHaul Logistics")
        p1 = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.user,
            amount=Decimal("5000.00"),
            invoice_number="COMMON-INV",
            description="First vendor request",
        )
        p2 = PaymentRequest.objects.create(
            vendor=other_vendor,
            requester=self.user,
            amount=Decimal("7000.00"),
            invoice_number="COMMON-INV",
            description="Second vendor request",
        )
        self.assertNotEqual(p1.id, p2.id)

    def test_rejection_requires_reason(self) -> None:
        with self.assertRaises(ValidationError):
            PaymentRequest.objects.create(
                vendor=self.vendor,
                requester=self.user,
                amount=Decimal("20000.00"),
                invoice_number="INV-REJ-01",
                description="Needs reason to reject",
                status=PaymentRequestStatus.REJECTED,
                rejection_reason="",
            )

    def test_amount_must_be_positive(self) -> None:
        with self.assertRaises((ValidationError, IntegrityError)):
            PaymentRequest.objects.create(
                vendor=self.vendor,
                requester=self.user,
                amount=Decimal("0.00"),
                invoice_number="INV-ZERO",
                description="Zero amount invalid",
            )


class PaymentAttemptModelTestCase(TestCase):
    def setUp(self) -> None:
        self.user = UserAccount.objects.create_user(username="finance1")
        self.vendor = Vendor.objects.create(name="BlueLine Plumbing")
        self.payment = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.user,
            amount=Decimal("42000.00"),
            invoice_number="INV-BL-101",
            description="Plumbing supplies",
        )

    def test_create_payment_attempt(self) -> None:
        attempt = PaymentAttempt.objects.create(
            payment_request=self.payment,
            idempotency_key="idemp-key-001",
            amount=self.payment.amount,
            status=PaymentAttemptStatus.PROCESSING,
            provider_reference="MOCK-REF-1001",
        )
        self.assertIsInstance(attempt.id, uuid.UUID)
        self.assertEqual(attempt.status, PaymentAttemptStatus.PROCESSING)
        self.assertEqual(attempt.provider_reference, "MOCK-REF-1001")
        self.assertEqual(attempt.history.count(), 1)

    def test_idempotency_key_uniqueness(self) -> None:
        PaymentAttempt.objects.create(
            payment_request=self.payment,
            idempotency_key="duplicate-idemp-key",
            amount=self.payment.amount,
        )
        with self.assertRaises((IntegrityError, ValidationError)):
            PaymentAttempt.objects.create(
                payment_request=self.payment,
                idempotency_key="duplicate-idemp-key",
                amount=self.payment.amount,
            )
