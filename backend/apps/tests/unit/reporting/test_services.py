"""Unit tests for reporting services and KPI aggregations."""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import UserAccount, UserRole
from apps.payments.models import (
    PaymentMethod,
    PaymentRequest,
    PaymentRequestStatus,
)
from apps.reporting import services
from apps.reporting.services import (
    get_failed_payments_report,
    get_payment_activity_summary,
    get_payments_by_project_report,
)
from apps.vendors.models import Project, Vendor


class ReportingServicesUnitTests(TestCase):
    """Unit test suite for reporting service calculation logic."""

    def setUp(self) -> None:
        self.user = UserAccount.objects.create_user(
            username="requester_rep",
            role=UserRole.EMPLOYEE,
        )
        self.vendor = Vendor.objects.create(
            name="Safaricom Business",
            email="b2b@safaricom.co.ke",
            payment_details={"kra_pin": "P051122334Z"},
        )
        self.project_a = Project.objects.create(
            name="Cloud Transformation",
            code="PRJ-CLOUD",
        )
        self.project_b = Project.objects.create(
            name="Branch Expansion",
            code="PRJ-BRANCH",
        )

        self.paid_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project_a,
            requester=self.user,
            created_by=self.user.id,
            amount=Decimal("50000.00"),
            invoice_number="INV-REP-001",
            description="Cloud hosting compute nodes",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.PAID,
        )

        self.pending_req1 = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project_a,
            requester=self.user,
            created_by=self.user.id,
            amount=Decimal("20000.00"),
            invoice_number="INV-REP-002",
            description="Additional disk storage",
            payment_method=PaymentMethod.MPESA,
            status=PaymentRequestStatus.PENDING_APPROVAL,
        )
        self.pending_req2 = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project_b,
            requester=self.user,
            created_by=self.user.id,
            amount=Decimal("30000.00"),
            invoice_number="INV-REP-003",
            description="Branch router setup",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.SUBMITTED,
        )

        self.failed_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project_b,
            requester=self.user,
            created_by=self.user.id,
            amount=Decimal("15000.00"),
            invoice_number="INV-REP-004",
            description="Branch biometric scanner",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.FAILED,
            rejection_reason="Bank account number invalid or frozen.",
        )

    def test_payment_activity_summary_metrics(self) -> None:
        summary = get_payment_activity_summary()

        self.assertEqual(summary["total_paid_amount"], "50000.00")
        self.assertEqual(summary["total_paid_count"], 1)
        self.assertEqual(summary["awaiting_approval_count"], 2)
        self.assertEqual(summary["awaiting_approval_amount"], "50000.00")
        self.assertEqual(summary["failed_payment_count"], 1)
        self.assertEqual(summary["failed_payment_amount"], "15000.00")
        self.assertEqual(summary["total_requests_count"], 4)
        self.assertEqual(summary["total_requested_amount"], "115000.00")

        legacy_summary = services.get_payment_summary_report()
        self.assertEqual(legacy_summary["total_paid"], "50000.00")
        self.assertEqual(legacy_summary["paid_count"], 1)
        self.assertEqual(legacy_summary["awaiting_approval_count"], 2)
        self.assertEqual(legacy_summary["failed_count"], 1)
        self.assertEqual(legacy_summary["total_failed"], "15000.00")

    def test_payment_activity_summary_period_filter(self) -> None:
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        future = today + timedelta(days=1)

        summary_past = get_payment_activity_summary(
            date_from=str(yesterday), date_to=str(today)
        )
        self.assertEqual(summary_past["total_requests_count"], 4)

        summary_future = get_payment_activity_summary(date_from=str(future))
        self.assertEqual(summary_future["total_requests_count"], 0)
        self.assertEqual(summary_future["total_paid_amount"], "0.00")

    def test_failed_payments_report(self) -> None:
        report = get_failed_payments_report()

        self.assertEqual(report["total_failed_count"], 1)
        self.assertEqual(report["total_failed_amount"], "15000.00")
        self.assertEqual(len(report["results"]), 1)

        item = report["results"][0]
        self.assertEqual(item["id"], str(self.failed_req.id))
        self.assertEqual(item["invoice_number"], "INV-REP-004")
        self.assertEqual(
            item["failure_reason"], "Bank account number invalid or frozen."
        )
        self.assertEqual(item["project_name"], "Branch Expansion")

    def test_failed_payments_report_project_filter(self) -> None:
        report_a = get_failed_payments_report(project_id=self.project_a.id)
        self.assertEqual(report_a["total_failed_count"], 0)

        report_b = get_failed_payments_report(project_id=self.project_b.id)
        self.assertEqual(report_b["total_failed_count"], 1)

    def test_payments_by_project_report(self) -> None:
        report = get_payments_by_project_report()
        self.assertEqual(report["count"], 2)

        proj_map = {p["project_code"]: p for p in report["results"]}

        proj_a = proj_map["PRJ-CLOUD"]
        self.assertEqual(proj_a["total_amount"], "70000.00")
        self.assertEqual(proj_a["paid_amount"], "50000.00")
        self.assertEqual(proj_a["pending_amount"], "20000.00")
        self.assertEqual(proj_a["total_count"], 2)
        self.assertEqual(proj_a["paid_count"], 1)
        self.assertEqual(proj_a["pending_count"], 1)

        proj_b = proj_map["PRJ-BRANCH"]
        self.assertEqual(proj_b["total_amount"], "45000.00")
        self.assertEqual(proj_b["paid_amount"], "0.00")
        self.assertEqual(proj_b["pending_amount"], "30000.00")
        self.assertEqual(proj_b["total_count"], 2)

        breakdown = services.get_project_breakdown_report()
        self.assertEqual(len(breakdown), 2)

    def test_failed_payments_report_vendor_filter_and_invalid_uuid(self) -> None:
        report = get_failed_payments_report(vendor_id=self.vendor.id)
        self.assertEqual(report["total_failed_count"], 1)

        with self.assertRaises(ValueError):
            get_failed_payments_report(project_id="invalid-project-uuid")

        with self.assertRaises(ValueError):
            get_failed_payments_report(vendor_id="invalid-vendor-uuid")
