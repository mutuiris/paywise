import uuid
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.approvals.models import Approval, ApprovalDecision, ApprovalTier
from apps.payments.models import PaymentRequest
from apps.vendors.models import Vendor


class ApprovalModelTestCase(TestCase):
    def setUp(self) -> None:
        self.requester = UserAccount.objects.create_user(
            username="requester_user",
            role=UserRole.EMPLOYEE,
        )
        self.manager = UserAccount.objects.create_user(
            username="manager_user",
            role=UserRole.MANAGER,
        )
        self.finance = UserAccount.objects.create_user(
            username="finance_user",
            role=UserRole.FINANCE_OFFICER,
        )
        self.vendor = Vendor.objects.create(name="PowerHire Kenya")
        self.payment = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.requester,
            amount=Decimal("42000.00"),
            invoice_number="PH-912",
            description="Excavator rental",
            created_by=self.requester.id,
        )

    def test_create_manager_approval(self) -> None:
        approval = Approval.objects.create(
            payment_request=self.payment,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
            created_by=self.manager.id,
        )
        self.assertIsInstance(approval.id, uuid.UUID)
        self.assertEqual(approval.tier, ApprovalTier.MANAGER)
        self.assertEqual(approval.decision, ApprovalDecision.APPROVED)
        self.assertIn("PH-912", str(approval))

    def test_rejection_requires_reason(self) -> None:
        with self.assertRaises(ValidationError):
            Approval.objects.create(
                payment_request=self.payment,
                approver=self.manager,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.REJECTED,
                reason="",
            )

    def test_self_approval_is_prevented(self) -> None:
        with self.assertRaises(ValidationError):
            Approval.objects.create(
                payment_request=self.payment,
                approver=self.requester,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.APPROVED,
            )

    def test_unique_payment_request_approver_tier(self) -> None:
        Approval.objects.create(
            payment_request=self.payment,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        with self.assertRaises((IntegrityError, ValidationError)):
            Approval.objects.create(
                payment_request=self.payment,
                approver=self.manager,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.APPROVED,
            )

    def test_self_approval_prevented_via_created_by(self) -> None:
        payment_without_requester = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=None,
            amount=Decimal("15000.00"),
            invoice_number="PH-913",
            description="Creator test without requester",
            created_by=self.manager.id,
        )
        with self.assertRaises(ValidationError):
            Approval.objects.create(
                payment_request=payment_without_requester,
                approver=self.manager,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.APPROVED,
            )

    def test_payment_request_deletion_protected_when_approved(self) -> None:
        from django.db.models import ProtectedError

        Approval.objects.create(
            payment_request=self.payment,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
            created_by=self.manager.id,
        )
        with self.assertRaises(ProtectedError):
            self.payment.delete()
