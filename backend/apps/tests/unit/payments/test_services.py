"""Unit tests for payment lifecycle, idempotency, and reconciliation services."""

from __future__ import annotations

from decimal import Decimal

from django.core.exceptions import PermissionDenied, ValidationError
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.approvals import services as approval_services
from apps.approvals.models import Approval, ApprovalDecision, ApprovalTier
from apps.audit.models import AuditAction, AuditEvent
from apps.payments import services
from apps.payments.models import (
    PaymentAttempt,
    PaymentAttemptStatus,
    PaymentMethod,
    PaymentRequestStatus,
)
from apps.payments.providers.base import PaymentProviderError
from apps.payments.providers.mock import MockPaymentProvider
from apps.vendors.models import Project, Vendor


class PaymentServicesTestCase(TestCase):
    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="emp_pay_svc", role=UserRole.EMPLOYEE
        )
        self.manager = UserAccount.objects.create_user(
            username="mgr_pay_svc", role=UserRole.MANAGER
        )
        self.finance = UserAccount.objects.create_user(
            username="fin_pay_svc", role=UserRole.FINANCE_OFFICER
        )
        self.admin = UserAccount.objects.create_user(
            username="adm_pay_svc", role=UserRole.ADMINISTRATOR
        )
        self.inactive_user = UserAccount.objects.create_user(
            username="inact_pay", role=UserRole.EMPLOYEE, is_active=False
        )

        self.vendor = Vendor.objects.create(
            name="Taifa Hardware Ltd",
            payment_details={"paybill": "554433", "account": "TAIFA"},
        )
        self.inactive_vendor = Vendor.objects.create(
            name="Defunct Electricals",
            is_active=False,
        )
        self.project = Project.objects.create(name="Kilimani Commercial Center")
        self.inactive_project = Project.objects.create(
            name="Abandoned Phase",
            is_active=False,
        )

    def test_create_payment_request_success(self) -> None:
        req = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            project_id=self.project.id,
            amount=Decimal("30000.00"),
            invoice_number="INV-TAIFA-001",
            description="Cement bags delivery",
            payment_method=PaymentMethod.MPESA,
            supporting_notes="Urgent site delivery",
        )
        self.assertEqual(req.status, PaymentRequestStatus.DRAFT)
        self.assertEqual(req.requester, self.employee)
        self.assertEqual(req.created_by, self.employee.id)
        self.assertEqual(req.amount, Decimal("30000.00"))

        # Verify audit record
        audit = AuditEvent.objects.filter(
            entity_id=req.id, action=AuditAction.PAYMENT_REQUEST_CREATED
        ).first()
        self.assertIsNotNone(audit)
        assert audit is not None
        self.assertEqual(audit.actor, self.employee)

    def test_create_payment_request_inactive_vendor_rejected(self) -> None:
        with self.assertRaises(ValidationError) as ctx:
            services.create_payment_request(
                actor=self.employee,
                vendor_id=self.inactive_vendor.id,
                amount=Decimal("10000.00"),
                invoice_number="INV-INACT-01",
                description="Invalid vendor test",
            )
        self.assertIn("inactive vendor", str(ctx.exception))

    def test_create_payment_request_inactive_project_rejected(self) -> None:
        with self.assertRaises(ValidationError) as ctx:
            services.create_payment_request(
                actor=self.employee,
                vendor_id=self.vendor.id,
                project_id=self.inactive_project.id,
                amount=Decimal("10000.00"),
                invoice_number="INV-INACT-PRJ",
                description="Invalid project test",
            )
        self.assertIn("inactive project", str(ctx.exception))

    def test_create_payment_request_duplicate_invoice_same_vendor_rejected(
        self,
    ) -> None:
        services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("15000.00"),
            invoice_number="INV-DUP-TEST",
            description="First request",
        )
        with self.assertRaises(ValidationError) as ctx:
            services.create_payment_request(
                actor=self.employee,
                vendor_id=self.vendor.id,
                amount=Decimal("18000.00"),
                invoice_number="INV-DUP-TEST",
                description="Duplicate invoice submission",
            )
        self.assertIn("already exists", str(ctx.exception))

    def test_create_payment_request_same_invoice_different_vendor_allowed(self) -> None:
        other_vendor = Vendor.objects.create(name="Baraka Steel Ltd")
        req1 = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("10000.00"),
            invoice_number="INV-COMMON-99",
            description="First vendor request",
        )
        req2 = services.create_payment_request(
            actor=self.employee,
            vendor_id=other_vendor.id,
            amount=Decimal("12000.00"),
            invoice_number="INV-COMMON-99",
            description="Second vendor request",
        )
        self.assertNotEqual(req1.id, req2.id)

    def test_submit_payment_request_transitions_to_submitted(self) -> None:
        req = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("25000.00"),
            invoice_number="INV-SUB-01",
            description="Draft to submit",
        )
        self.assertEqual(req.status, PaymentRequestStatus.DRAFT)

        submitted = services.submit_payment_request(req, actor=self.employee)
        self.assertEqual(submitted.status, PaymentRequestStatus.SUBMITTED)

        audit = AuditEvent.objects.filter(
            entity_id=req.id, action=AuditAction.PAYMENT_REQUEST_SUBMITTED
        ).first()
        self.assertIsNotNone(audit)

    def test_submit_payment_request_unauthorized_user_denied(self) -> None:
        other_employee = UserAccount.objects.create_user(
            username="other_emp", role=UserRole.EMPLOYEE
        )
        req = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("25000.00"),
            invoice_number="INV-SUB-UNAUTH",
            description="Cannot submit someone else's draft",
        )
        with self.assertRaises(PermissionDenied):
            services.submit_payment_request(req, actor=other_employee)

    def test_update_payment_request_draft(self) -> None:
        req = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("10000.00"),
            invoice_number="INV-UPD-01",
            description="Initial description",
        )
        updated = services.update_payment_request(
            req,
            actor=self.employee,
            description="Updated description",
            amount=Decimal("15000.00"),
        )
        self.assertEqual(updated.description, "Updated description")
        self.assertEqual(updated.amount, Decimal("15000.00"))

    def test_update_amount_invalidates_approvals(self) -> None:
        req = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("40000.00"),
            invoice_number="INV-AMNT-CHG",
            description="Material change test",
        )
        services.submit_payment_request(req, actor=self.employee)

        # Manager approves
        approval_services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)

        # Amount is increased to 60,000 (crossing threshold and invalidating approvals)
        updated = services.update_payment_request(
            req,
            actor=self.manager,
            amount=Decimal("60000.00"),
        )
        self.assertEqual(updated.status, PaymentRequestStatus.PENDING_APPROVAL)
        active_approvals = Approval.objects.filter(payment_request=req, is_active=True)
        self.assertEqual(active_approvals.count(), 0)

    def test_process_payment_request_success(self) -> None:
        req = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("45000.00"),
            invoice_number="INV-PROC-SUCC",
            description="Process success test",
        )
        services.submit_payment_request(req, actor=self.employee)
        approval_services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)

        provider = MockPaymentProvider(mode="FORCE_SUCCESS")
        attempt, paid_req = services.process_payment_request(
            payment_request_id=req.id,
            idempotency_key="idemp-succ-001",
            actor=self.finance,
            provider=provider,
        )
        self.assertEqual(attempt.status, PaymentAttemptStatus.SUCCESS)
        self.assertEqual(paid_req.status, PaymentRequestStatus.PAID)
        self.assertTrue(attempt.provider_reference.startswith("MPESA-MOCK-"))

        # Verify audit event
        audit = AuditEvent.objects.filter(
            entity_id=req.id, action=AuditAction.PAYMENT_COMPLETED
        ).first()
        self.assertIsNotNone(audit)

    def test_provider_exception_becomes_ambiguous_attempt(self) -> None:
        req = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("45000.00"),
            invoice_number="INV-PROC-EXCEPTION",
            description="Provider exception test",
        )
        services.submit_payment_request(req, actor=self.employee)
        approval_services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )

        class FailingProvider(MockPaymentProvider):
            def process_payment(self, **kwargs):
                raise PaymentProviderError("provider unavailable")

        attempt, processing_req = services.process_payment_request(
            payment_request_id=req.id,
            idempotency_key="idemp-provider-exception",
            actor=self.finance,
            provider=FailingProvider(),
        )

        self.assertEqual(attempt.status, PaymentAttemptStatus.AMBIGUOUS)
        self.assertEqual(processing_req.status, PaymentRequestStatus.PROCESSING)
        self.assertEqual(
            attempt.failure_reason, "Provider outcome requires reconciliation."
        )

    def test_process_payment_request_idempotency_replay(self) -> None:
        req = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("20000.00"),
            invoice_number="INV-IDEMP-REPLAY",
            description="Replay test",
        )
        services.submit_payment_request(req, actor=self.employee)
        approval_services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )

        key = "idemp-replay-key-1"
        provider = MockPaymentProvider(mode="FORCE_SUCCESS")
        att1, req1 = services.process_payment_request(
            payment_request_id=req.id,
            idempotency_key=key,
            actor=self.finance,
            provider=provider,
        )
        self.assertEqual(att1.status, PaymentAttemptStatus.SUCCESS)

        # A replay returns the existing attempt without calling the provider again.
        att2, req2 = services.process_payment_request(
            payment_request_id=req.id,
            idempotency_key=key,
            actor=self.finance,
            provider=provider,
        )
        self.assertEqual(att1.id, att2.id)
        self.assertEqual(att2.status, PaymentAttemptStatus.SUCCESS)
        self.assertEqual(PaymentAttempt.objects.filter(idempotency_key=key).count(), 1)

    def test_process_payment_request_idempotency_key_mismatch_rejected(self) -> None:
        req1 = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("10000.00"),
            invoice_number="INV-MISMATCH-1",
            description="First request",
        )
        services.submit_payment_request(req1, actor=self.employee)
        approval_services.record_approval_decision(
            payment_request_id=req1.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )

        key = "shared-idemp-key"
        services.process_payment_request(
            payment_request_id=req1.id,
            idempotency_key=key,
            actor=self.finance,
        )

        # Attempt to use the same key for a different payment request
        req2 = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("15000.00"),
            invoice_number="INV-MISMATCH-2",
            description="Second request",
        )
        services.submit_payment_request(req2, actor=self.employee)
        approval_services.record_approval_decision(
            payment_request_id=req2.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )

        with self.assertRaises(ValidationError) as ctx:
            services.process_payment_request(
                payment_request_id=req2.id,
                idempotency_key=key,
                actor=self.finance,
            )
        self.assertIn("already been used for another", str(ctx.exception))

    def test_process_payment_request_failure_outcome(self) -> None:
        req = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("10000.99"),  # .99 triggers simulated provider failure
            invoice_number="INV-PROC-FAIL",
            description="Failure test",
        )
        services.submit_payment_request(req, actor=self.employee)
        approval_services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )

        attempt, failed_req = services.process_payment_request(
            payment_request_id=req.id,
            idempotency_key="idemp-proc-fail-1",
            actor=self.finance,
        )
        self.assertEqual(attempt.status, PaymentAttemptStatus.FAILED)
        self.assertEqual(failed_req.status, PaymentRequestStatus.FAILED)
        self.assertTrue(len(attempt.failure_reason) > 0)

    def test_process_payment_request_ambiguous_and_reconciliation(self) -> None:
        req = services.create_payment_request(
            actor=self.employee,
            vendor_id=self.vendor.id,
            amount=Decimal("10000.88"),  # .88 triggers ambiguous outcome
            invoice_number="INV-PROC-AMBIG",
            description="Ambiguity test",
        )
        services.submit_payment_request(req, actor=self.employee)
        approval_services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )

        attempt, proc_req = services.process_payment_request(
            payment_request_id=req.id,
            idempotency_key="idemp-proc-ambig-1",
            actor=self.finance,
        )
        self.assertEqual(attempt.status, PaymentAttemptStatus.AMBIGUOUS)
        # Request remains in PROCESSING, not failed!
        self.assertEqual(proc_req.status, PaymentRequestStatus.PROCESSING)

        # Reconcile attempt
        reconciled_att, reconciled_req = services.reconcile_payment_attempt(
            payment_attempt_id=attempt.id,
            actor=self.finance,
        )
        self.assertEqual(reconciled_att.status, PaymentAttemptStatus.SUCCESS)
        self.assertEqual(reconciled_req.status, PaymentRequestStatus.PAID)
