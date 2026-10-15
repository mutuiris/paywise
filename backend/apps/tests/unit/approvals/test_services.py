"""Unit tests for approval policy services and decision business logic."""

from __future__ import annotations

import uuid
from decimal import Decimal

from django.core.exceptions import PermissionDenied, ValidationError
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.approvals import services
from apps.approvals.models import Approval, ApprovalDecision, ApprovalTier
from apps.audit.models import AuditAction, AuditEvent
from apps.payments.models import (
    PaymentMethod,
    PaymentRequest,
    PaymentRequestStatus,
)
from apps.vendors.models import Vendor


class ApprovalServicesTestCase(TestCase):
    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="emp_approv", role=UserRole.EMPLOYEE
        )
        self.manager = UserAccount.objects.create_user(
            username="mgr_approv", role=UserRole.MANAGER
        )
        self.finance = UserAccount.objects.create_user(
            username="fin_approv", role=UserRole.FINANCE_OFFICER
        )
        self.admin = UserAccount.objects.create_user(
            username="adm_approv", role=UserRole.ADMINISTRATOR
        )
        self.inactive_manager = UserAccount.objects.create_user(
            username="inact_mgr", role=UserRole.MANAGER, is_active=False
        )

        self.vendor = Vendor.objects.create(name="Apex Supplies Ltd")

    def _create_submitted_request(
        self, amount: Decimal, requester: UserAccount | None = None
    ) -> PaymentRequest:
        req = requester or self.employee
        return PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=req,
            amount=amount,
            invoice_number=f"INV-{uuid.uuid4().hex[:6].upper()}",
            description="Test payment description",
            payment_method=PaymentMethod.MPESA,
            status=PaymentRequestStatus.SUBMITTED,
            created_by=req.id,
        )

    def test_threshold_boundary_50000_manager_only(self) -> None:
        tiers_at_50k = services.get_required_tiers(Decimal("50000.00"))
        self.assertEqual(tiers_at_50k, [ApprovalTier.MANAGER])

        req = self._create_submitted_request(Decimal("50000.00"))
        approval, updated = services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        self.assertEqual(approval.decision, ApprovalDecision.APPROVED)
        self.assertEqual(updated.status, PaymentRequestStatus.APPROVED)

    def test_threshold_boundary_50000_01_requires_both_tiers(self) -> None:
        tiers_above_50k = services.get_required_tiers(Decimal("50000.01"))
        self.assertEqual(tiers_above_50k, [ApprovalTier.MANAGER, ApprovalTier.FINANCE])

        req = self._create_submitted_request(Decimal("50000.01"))

        # Step 1: Manager approves -> still PENDING_APPROVAL
        _, step1 = services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        self.assertEqual(step1.status, PaymentRequestStatus.PENDING_APPROVAL)

        # Step 2: Finance approves -> APPROVED
        _, step2 = services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.finance,
            tier=ApprovalTier.FINANCE,
            decision=ApprovalDecision.APPROVED,
        )
        self.assertEqual(step2.status, PaymentRequestStatus.APPROVED)

    def test_finance_cannot_approve_before_manager(self) -> None:
        req = self._create_submitted_request(Decimal("75000.00"))
        with self.assertRaises(ValidationError) as ctx:
            services.record_approval_decision(
                payment_request_id=req.id,
                approver=self.finance,
                tier=ApprovalTier.FINANCE,
                decision=ApprovalDecision.APPROVED,
            )
        self.assertIn("Manager approval is required", str(ctx.exception))

    def test_self_approval_prevented_for_requester(self) -> None:
        manager_req = self._create_submitted_request(
            Decimal("25000.00"), requester=self.manager
        )
        with self.assertRaises(ValidationError) as ctx:
            services.record_approval_decision(
                payment_request_id=manager_req.id,
                approver=self.manager,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.APPROVED,
            )
        self.assertIn("cannot approve their own", str(ctx.exception))

    def test_self_approval_prevented_for_creator_without_requester(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=None,
            amount=Decimal("20000.00"),
            invoice_number=f"INV-{uuid.uuid4().hex[:6].upper()}",
            description="Creator-only request",
            status=PaymentRequestStatus.SUBMITTED,
            created_by=self.manager.id,
        )
        with self.assertRaises(ValidationError) as ctx:
            services.record_approval_decision(
                payment_request_id=req.id,
                approver=self.manager,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.APPROVED,
            )
        self.assertIn("cannot approve their own", str(ctx.exception))

    def test_rejection_requires_nonblank_reason(self) -> None:
        req = self._create_submitted_request(Decimal("10000.00"))
        with self.assertRaises(ValidationError) as ctx:
            services.record_approval_decision(
                payment_request_id=req.id,
                approver=self.manager,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.REJECTED,
                reason="   ",
            )
        self.assertIn("reason", str(ctx.exception))

    def test_rejection_moves_status_to_rejected_and_emits_audit(self) -> None:
        req = self._create_submitted_request(Decimal("10000.00"))
        approval, updated = services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.REJECTED,
            reason="Incorrect item cost specified",
        )
        self.assertEqual(updated.status, PaymentRequestStatus.REJECTED)
        self.assertEqual(updated.rejection_reason, "Incorrect item cost specified")

        # Verify audit event emitted
        event = AuditEvent.objects.filter(
            entity_id=req.id, action=AuditAction.PAYMENT_REQUEST_REJECTED
        ).first()
        self.assertIsNotNone(event)
        assert event is not None
        self.assertIn("Incorrect item cost specified", event.description)

    def test_cannot_approve_already_approved_request(self) -> None:
        req = self._create_submitted_request(Decimal("20000.00"))
        services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        # Attempt second approval on already approved request
        other_manager = UserAccount.objects.create_user(
            username="mgr_other", role=UserRole.MANAGER
        )
        with self.assertRaises(ValidationError) as ctx:
            services.record_approval_decision(
                payment_request_id=req.id,
                approver=other_manager,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.APPROVED,
            )
        self.assertIn("Cannot record decision", str(ctx.exception))

    def test_duplicate_tier_approval_prevented(self) -> None:
        req = self._create_submitted_request(Decimal("80000.00"))
        services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        # Another manager attempts to approve MANAGER tier again
        other_mgr = UserAccount.objects.create_user(
            username="mgr2", role=UserRole.MANAGER
        )
        with self.assertRaises(ValidationError) as ctx:
            services.record_approval_decision(
                payment_request_id=req.id,
                approver=other_mgr,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.APPROVED,
            )
        self.assertIn("already been approved", str(ctx.exception))

    def test_wrong_role_cannot_approve(self) -> None:
        req = self._create_submitted_request(Decimal("20000.00"))
        # Employee cannot approve manager tier
        with self.assertRaises(PermissionDenied):
            services.record_approval_decision(
                payment_request_id=req.id,
                approver=self.employee,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.APPROVED,
            )
        # Manager cannot approve finance tier
        with self.assertRaises(PermissionDenied):
            services.record_approval_decision(
                payment_request_id=req.id,
                approver=self.manager,
                tier=ApprovalTier.FINANCE,
                decision=ApprovalDecision.APPROVED,
            )

    def test_inactive_user_cannot_approve(self) -> None:
        req = self._create_submitted_request(Decimal("20000.00"))
        with self.assertRaises(PermissionDenied):
            services.record_approval_decision(
                payment_request_id=req.id,
                approver=self.inactive_manager,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.APPROVED,
            )

    def test_invalidate_existing_approvals(self) -> None:
        req = self._create_submitted_request(Decimal("40000.00"))
        services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)

        # Invalidate approvals
        count = services.invalidate_existing_approvals(
            req, actor=self.manager, reason="Amount increased"
        )
        self.assertEqual(count, 1)

        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.PENDING_APPROVAL)
        active_approvals = Approval.objects.filter(payment_request=req, is_active=True)
        self.assertEqual(active_approvals.count(), 0)

        # Historical record preserved
        all_approvals = Approval.objects.filter(payment_request=req)
        self.assertEqual(all_approvals.count(), 1)
        approval = all_approvals.first()
        assert approval is not None
        self.assertFalse(approval.is_active)
