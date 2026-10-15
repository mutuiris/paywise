from decimal import Decimal

from django.core.exceptions import PermissionDenied, ValidationError
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.approvals.models import ApprovalDecision, ApprovalTier
from apps.approvals.services import (
    get_approval_queue,
    get_approved_tiers,
    get_pending_tiers,
    get_required_tiers,
    is_fully_approved,
    record_approval,
)
from apps.payments.models import PaymentRequest, PaymentRequestStatus
from apps.vendors.models import Vendor


class ApprovalServicesTestCase(TestCase):
    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="srv_emp",
            role=UserRole.EMPLOYEE,
        )
        self.manager = UserAccount.objects.create_user(
            username="srv_mgr",
            role=UserRole.MANAGER,
        )
        self.manager2 = UserAccount.objects.create_user(
            username="srv_mgr2",
            role=UserRole.MANAGER,
        )
        self.finance = UserAccount.objects.create_user(
            username="srv_fin",
            role=UserRole.FINANCE_OFFICER,
        )
        self.admin = UserAccount.objects.create_user(
            username="srv_admin",
            role=UserRole.ADMINISTRATOR,
        )
        self.vendor = Vendor.objects.create(name="Vendor Service Test")

    def test_approval_threshold_tier_calculation(self) -> None:
        # <= KES 50,000 requires only Manager
        req_low = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("50000.00"),
            invoice_number="INV-SRV-50K",
            description="Threshold boundary",
            created_by=self.employee.id,
        )
        self.assertEqual(get_required_tiers(req_low), [ApprovalTier.MANAGER])

        # > KES 50,000 requires Manager and Finance
        req_high = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("50000.01"),
            invoice_number="INV-SRV-50K-PLUS",
            description="Exceeds threshold",
            created_by=self.employee.id,
        )
        self.assertEqual(
            get_required_tiers(req_high),
            [ApprovalTier.MANAGER, ApprovalTier.FINANCE],
        )

    def test_single_approval_workflow_low_value(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("35000.00"),
            invoice_number="INV-SRV-LOW",
            description="Low value payment",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        self.assertFalse(is_fully_approved(req))
        self.assertEqual(get_pending_tiers(req), [ApprovalTier.MANAGER])

        # Manager approves
        approval = record_approval(
            payment_request=req,
            approver=self.manager,
            decision=ApprovalDecision.APPROVED,
        )
        self.assertEqual(approval.decision, ApprovalDecision.APPROVED)
        self.assertEqual(approval.tier, ApprovalTier.MANAGER)

        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)
        self.assertTrue(is_fully_approved(req))
        self.assertEqual(get_pending_tiers(req), [])
        self.assertEqual(get_approved_tiers(req), [ApprovalTier.MANAGER])

    def test_multi_tier_approval_workflow_high_value(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("120000.00"),
            invoice_number="INV-SRV-HIGH",
            description="High value server purchase",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        self.assertEqual(
            get_required_tiers(req),
            [ApprovalTier.MANAGER, ApprovalTier.FINANCE],
        )

        # Step 1: Manager approves
        record_approval(
            payment_request=req,
            approver=self.manager,
            decision=ApprovalDecision.APPROVED,
        )
        req.refresh_from_db()
        # Request remains in PENDING_APPROVAL because Finance sign-off is still required
        self.assertEqual(req.status, PaymentRequestStatus.PENDING_APPROVAL)
        self.assertFalse(is_fully_approved(req))
        self.assertEqual(get_pending_tiers(req), [ApprovalTier.FINANCE])
        self.assertEqual(get_approved_tiers(req), [ApprovalTier.MANAGER])

        # Step 2: Finance approves
        record_approval(
            payment_request=req,
            approver=self.finance,
            decision=ApprovalDecision.APPROVED,
        )
        req.refresh_from_db()
        # Now fully approved
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)
        self.assertTrue(is_fully_approved(req))
        self.assertEqual(get_pending_tiers(req), [])

    def test_rejection_requires_reason_and_updates_status(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("45000.00"),
            invoice_number="INV-SRV-REJ",
            description="Questionable expense",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )

        # Empty reason raises ValidationError
        with self.assertRaises(ValidationError):
            record_approval(
                payment_request=req,
                approver=self.manager,
                decision=ApprovalDecision.REJECTED,
                reason="",
            )

        # Valid rejection with reason
        rejection = record_approval(
            payment_request=req,
            approver=self.manager,
            decision=ApprovalDecision.REJECTED,
            reason="Exceeds department travel budget allocation for Q4.",
        )
        self.assertEqual(rejection.decision, ApprovalDecision.REJECTED)
        self.assertEqual(
            rejection.reason, "Exceeds department travel budget allocation for Q4."
        )

        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.REJECTED)
        self.assertEqual(
            req.rejection_reason, "Exceeds department travel budget allocation for Q4."
        )

    def test_self_approval_prevented_in_service(self) -> None:
        mgr_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.manager,
            amount=Decimal("15000.00"),
            invoice_number="INV-SRV-SELF",
            description="Manager expense",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.manager.id,
        )
        with self.assertRaises(PermissionDenied):
            record_approval(
                payment_request=mgr_req,
                approver=self.manager,
                decision=ApprovalDecision.APPROVED,
            )

    def test_approval_queue_filters_self_authored_and_by_role(self) -> None:
        # Req 1: created by employee, 30k -> manager can approve
        req1 = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("30000.00"),
            invoice_number="INV-Q-01",
            description="Req 1",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        # Req 2: created by manager, 80k -> manager cannot approve own,
        # but finance can approve
        req2 = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.manager,
            amount=Decimal("80000.00"),
            invoice_number="INV-Q-02",
            description="Req 2",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.manager.id,
        )
        # Req 3: created by employee, 90k -> both manager and finance can approve
        req3 = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("90000.00"),
            invoice_number="INV-Q-03",
            description="Req 3",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )

        # Manager view: sees req1 and req3, but NOT req2 (self-authored)
        mgr_queue = get_approval_queue(self.manager)
        mgr_ids = list(mgr_queue.values_list("id", flat=True))
        self.assertIn(req1.id, mgr_ids)
        self.assertIn(req3.id, mgr_ids)
        self.assertNotIn(req2.id, mgr_ids)

        # Finance view: sees req2 and req3 (>50k), but NOT req1 (<=50k)
        fin_queue = get_approval_queue(self.finance)
        fin_ids = list(fin_queue.values_list("id", flat=True))
        self.assertIn(req2.id, fin_ids)
        self.assertIn(req3.id, fin_ids)
        self.assertNotIn(req1.id, fin_ids)

        # Employee view: empty queue
        emp_queue = get_approval_queue(self.employee)
        self.assertEqual(emp_queue.count(), 0)

    def test_finance_approves_first_then_manager_workflow(self) -> None:
        """Verifies multi-tier approvals can be fulfilled in any order."""
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("85000.00"),
            invoice_number="INV-SRV-ORDER",
            description="High value server rack",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )

        # Finance approves first
        record_approval(
            payment_request=req,
            approver=self.finance,
            decision=ApprovalDecision.APPROVED,
            tier=ApprovalTier.FINANCE,
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.PENDING_APPROVAL)
        self.assertFalse(is_fully_approved(req))
        self.assertEqual(get_pending_tiers(req), [ApprovalTier.MANAGER])

        # Manager approves second
        record_approval(
            payment_request=req,
            approver=self.manager,
            decision=ApprovalDecision.APPROVED,
            tier=ApprovalTier.MANAGER,
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)
        self.assertTrue(is_fully_approved(req))

    def test_admin_can_approve_both_tiers(self) -> None:
        """Administrators possess permissions across all tiers."""
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("70000.00"),
            invoice_number="INV-SRV-ADMIN",
            description="Admin approved request",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        record_approval(
            payment_request=req,
            approver=self.admin,
            decision=ApprovalDecision.APPROVED,
            tier=ApprovalTier.MANAGER,
        )
        req.refresh_from_db()
        self.assertEqual(get_approved_tiers(req), [ApprovalTier.MANAGER])

    def test_get_approval_history_and_re_evaluate_state(self) -> None:
        """Verifies approval history serialization and re-evaluation."""
        from apps.approvals.services import (
            get_approval_history,
            re_evaluate_approval_state,
        )

        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("20000.00"),
            invoice_number="INV-SRV-HIST",
            description="History test",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        record_approval(
            payment_request=req,
            approver=self.manager,
            decision=ApprovalDecision.APPROVED,
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)

        history = get_approval_history(req)
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0]["decision"], ApprovalDecision.APPROVED)
        self.assertEqual(history[0]["approver_name"], self.manager.username)

        # Re-evaluate
        re_evaluate_approval_state(req)
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.PENDING_APPROVAL)
        self.assertFalse(is_fully_approved(req))
