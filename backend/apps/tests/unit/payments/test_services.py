"""Unit tests for payment lifecycle, idempotency, and search services."""

from __future__ import annotations

from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.core.exceptions import PermissionDenied, ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import UserAccount, UserRole
from apps.approvals import services as approval_services
from apps.approvals.models import Approval, ApprovalDecision, ApprovalTier
from apps.audit.models import AuditAction, AuditEvent
from apps.payments import services
from apps.payments.models import (
    PaymentAttempt,
    PaymentAttemptStatus,
    PaymentMethod,
    PaymentRequest,
    PaymentRequestStatus,
)
from apps.payments.providers.base import PaymentProviderError
from apps.payments.providers.mock import MockPaymentProvider
from apps.payments.services import (
    filter_payment_requests,
    parse_datetime_boundary,
)
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

        approval_services.record_approval_decision(
            payment_request_id=req.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)

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
        att1, _ = services.process_payment_request(
            payment_request_id=req.id,
            idempotency_key=key,
            actor=self.finance,
            provider=provider,
        )
        self.assertEqual(att1.status, PaymentAttemptStatus.SUCCESS)

        att2, _ = services.process_payment_request(
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
            amount=Decimal("10000.99"),
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
            amount=Decimal("10000.88"),
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
        self.assertEqual(proc_req.status, PaymentRequestStatus.PROCESSING)

        reconciled_att, reconciled_req = services.reconcile_payment_attempt(
            payment_attempt_id=attempt.id,
            actor=self.finance,
        )
        self.assertEqual(reconciled_att.status, PaymentAttemptStatus.SUCCESS)
        self.assertEqual(reconciled_req.status, PaymentRequestStatus.PAID)


class ParseDatetimeBoundaryUnitTests(TestCase):
    """Unit tests for parse_datetime_boundary utility."""

    def test_parse_none_or_empty(self) -> None:
        self.assertIsNone(parse_datetime_boundary(None))
        self.assertIsNone(parse_datetime_boundary(""))
        self.assertIsNone(parse_datetime_boundary("   "))

    def test_parse_calendar_date_start_and_end_of_day(self) -> None:
        start = parse_datetime_boundary("2026-10-15", is_end_of_day=False)
        self.assertIsNotNone(start)
        assert start is not None
        self.assertTrue(timezone.is_aware(start))
        self.assertEqual(start.date(), date(2026, 10, 15))
        self.assertEqual(start.time(), time.min)

        end = parse_datetime_boundary("2026-10-15", is_end_of_day=True)
        self.assertIsNotNone(end)
        assert end is not None
        self.assertTrue(timezone.is_aware(end))
        self.assertEqual(end.date(), date(2026, 10, 15))
        self.assertEqual(end.time(), time(23, 59, 59, 999999))

    def test_parse_iso_string_with_time(self) -> None:
        dt = parse_datetime_boundary("2026-10-15T14:30:00")
        self.assertIsNotNone(dt)
        assert dt is not None
        self.assertTrue(timezone.is_aware(dt))
        self.assertEqual(dt.hour, 14)
        self.assertEqual(dt.minute, 30)

    def test_parse_date_and_datetime_objects(self) -> None:
        d = date(2026, 10, 20)
        start = parse_datetime_boundary(d, is_end_of_day=False)
        self.assertIsNotNone(start)
        assert start is not None
        self.assertTrue(timezone.is_aware(start))
        self.assertEqual(start.date(), d)
        self.assertEqual(start.time(), time.min)

        naive_dt = datetime(2026, 10, 20, 10, 15)
        aware_dt = parse_datetime_boundary(naive_dt)
        self.assertIsNotNone(aware_dt)
        assert aware_dt is not None
        self.assertTrue(timezone.is_aware(aware_dt))

    def test_parse_invalid_string_raises_value_error(self) -> None:
        with self.assertRaises(ValueError):
            parse_datetime_boundary("not-a-date")


class FilterPaymentRequestsServiceTests(TestCase):
    """Unit tests for filter_payment_requests composable query logic."""

    def setUp(self) -> None:
        self.finance_user = UserAccount.objects.create_user(
            username="finance_steve",
            email="finance_steve@example.com",
            role=UserRole.FINANCE_OFFICER,
        )
        self.employee1 = UserAccount.objects.create_user(
            username="employee_alice",
            email="alice@example.com",
            first_name="Alice",
            last_name="Mwangi",
            role=UserRole.EMPLOYEE,
        )
        self.employee2 = UserAccount.objects.create_user(
            username="employee_brian",
            email="brian@example.com",
            first_name="Brian",
            last_name="Otieno",
            role=UserRole.EMPLOYEE,
        )

        self.vendor1 = Vendor.objects.create(
            name="Safari Tech Ltd",
            email="safari@example.com",
            payment_details={"kra_pin": "P051234567Z", "bank": "0110901234567"},
        )
        self.vendor2 = Vendor.objects.create(
            name="Apex Office Supplies",
            email="apex@example.com",
            payment_details={"kra_pin": "P059876543A", "bank": "0110909876543"},
        )

        self.project1 = Project.objects.create(
            name="Core Banking Infrastructure",
            code="PRJ-CBI",
        )
        self.project2 = Project.objects.create(
            name="Field Logistics Operations",
            code="PRJ-FLO",
        )

        self.req1 = PaymentRequest.objects.create(
            vendor=self.vendor1,
            project=self.project1,
            requester=self.employee1,
            created_by=self.employee1.id,
            amount=Decimal("45000.00"),
            currency="KES",
            invoice_number="INV-SAF-001",
            description="Quarterly server licensing",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.PENDING_APPROVAL,
        )
        self.req2 = PaymentRequest.objects.create(
            vendor=self.vendor2,
            project=self.project2,
            requester=self.employee2,
            created_by=self.employee2.id,
            amount=Decimal("15000.00"),
            currency="KES",
            invoice_number="INV-APX-001",
            description="Office stationery and paper reams",
            payment_method=PaymentMethod.MPESA,
            status=PaymentRequestStatus.APPROVED,
        )
        self.req3 = PaymentRequest.objects.create(
            vendor=self.vendor1,
            project=self.project2,
            requester=self.employee1,
            created_by=self.employee1.id,
            amount=Decimal("120000.00"),
            currency="KES",
            invoice_number="INV-SAF-002",
            description="Satellite terminal equipment",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.PAID,
        )

    def test_filter_by_vendor_id_and_vendor_name(self) -> None:
        qs = filter_payment_requests(user=self.finance_user, vendor_id=self.vendor1.id)
        self.assertEqual(qs.count(), 2)
        self.assertIn(self.req1, qs)
        self.assertIn(self.req3, qs)

        qs_name = filter_payment_requests(user=self.finance_user, vendor="Apex")
        self.assertEqual(qs_name.count(), 1)
        self.assertEqual(qs_name.first(), self.req2)

    def test_filter_by_status_single_and_comma_separated(self) -> None:
        qs_paid = filter_payment_requests(
            user=self.finance_user, status=PaymentRequestStatus.PAID
        )
        self.assertEqual(qs_paid.count(), 1)
        self.assertEqual(qs_paid.first(), self.req3)

        qs_multi = filter_payment_requests(
            user=self.finance_user, status="PENDING_APPROVAL, APPROVED"
        )
        self.assertEqual(qs_multi.count(), 2)
        self.assertIn(self.req1, qs_multi)
        self.assertIn(self.req2, qs_multi)

    def test_filter_by_requester_id_and_username(self) -> None:
        qs_id = filter_payment_requests(
            user=self.finance_user, requester_id=self.employee1.id
        )
        self.assertEqual(qs_id.count(), 2)

        qs_user = filter_payment_requests(user=self.finance_user, requester="alice")
        self.assertEqual(qs_user.count(), 2)

    def test_filter_by_project_id_and_code(self) -> None:
        qs_proj = filter_payment_requests(
            user=self.finance_user, project_id=self.project1.id
        )
        self.assertEqual(qs_proj.count(), 1)
        self.assertEqual(qs_proj.first(), self.req1)

        qs_code = filter_payment_requests(user=self.finance_user, project="PRJ-FLO")
        self.assertEqual(qs_code.count(), 2)

    def test_filter_by_payment_method(self) -> None:
        qs_mpesa = filter_payment_requests(
            user=self.finance_user, payment_method=PaymentMethod.MPESA
        )
        self.assertEqual(qs_mpesa.count(), 1)
        self.assertEqual(qs_mpesa.first(), self.req2)

    def test_filter_by_amount_range(self) -> None:
        qs_min = filter_payment_requests(user=self.finance_user, min_amount="50000.00")
        self.assertEqual(qs_min.count(), 1)
        self.assertEqual(qs_min.first(), self.req3)

        qs_range = filter_payment_requests(
            user=self.finance_user,
            min_amount="10000.00",
            max_amount="50000.00",
        )
        self.assertEqual(qs_range.count(), 2)
        self.assertIn(self.req1, qs_range)
        self.assertIn(self.req2, qs_range)

    def test_filter_by_free_text_search(self) -> None:
        qs_inv = filter_payment_requests(
            user=self.finance_user, search_query="INV-SAF-002"
        )
        self.assertEqual(qs_inv.count(), 1)
        self.assertEqual(qs_inv.first(), self.req3)

        qs_desc = filter_payment_requests(
            user=self.finance_user, search_query="stationery"
        )
        self.assertEqual(qs_desc.count(), 1)
        self.assertEqual(qs_desc.first(), self.req2)

    def test_filter_by_deterministic_date_range(self) -> None:
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)

        qs_today = filter_payment_requests(
            user=self.finance_user,
            date_from=str(yesterday),
            date_to=str(today),
        )
        self.assertEqual(qs_today.count(), 3)

        qs_future = filter_payment_requests(
            user=self.finance_user,
            date_from=str(tomorrow),
        )
        self.assertEqual(qs_future.count(), 0)

    def test_role_based_scoping_for_employees(self) -> None:
        qs_alice = filter_payment_requests(user=self.employee1)
        self.assertEqual(qs_alice.count(), 2)
        self.assertNotIn(self.req2, qs_alice)

        qs_brian = filter_payment_requests(user=self.employee2)
        self.assertEqual(qs_brian.count(), 1)
        self.assertEqual(qs_brian.first(), self.req2)

    def test_composable_filter_combination(self) -> None:
        qs = filter_payment_requests(
            user=self.finance_user,
            vendor="Safari",
            status="PENDING_APPROVAL",
            project="PRJ-CBI",
            min_amount="40000",
            max_amount="50000",
        )
        self.assertEqual(qs.count(), 1)
        self.assertEqual(qs.first(), self.req1)

    def test_invalid_uuid_and_decimal_raise_value_error(self) -> None:
        with self.assertRaises(ValueError):
            filter_payment_requests(
                user=self.finance_user, vendor_id="not-a-valid-uuid"
            )

        with self.assertRaises(ValueError):
            filter_payment_requests(
                user=self.finance_user, requester_id="invalid-requester-uuid"
            )

        with self.assertRaises(ValueError):
            filter_payment_requests(
                user=self.finance_user, project_id="invalid-project-uuid"
            )

        with self.assertRaises(ValueError):
            filter_payment_requests(
                user=self.finance_user, min_amount="invalid-decimal"
            )

        with self.assertRaises(ValueError):
            filter_payment_requests(
                user=self.finance_user, max_amount="invalid-decimal"
            )

    def test_list_parameters_for_status_and_payment_methods(self) -> None:
        qs_status = filter_payment_requests(
            user=self.finance_user,
            status=[PaymentRequestStatus.PAID, PaymentRequestStatus.APPROVED],
        )
        self.assertEqual(qs_status.count(), 2)

        qs_methods = filter_payment_requests(
            user=self.finance_user,
            payment_method=[PaymentMethod.MPESA, PaymentMethod.BANK_TRANSFER],
        )
        self.assertEqual(qs_methods.count(), 3)
