"""Unit tests for reporting services and aggregations."""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import UserAccount, UserRole
from apps.payments.models import (
    PaymentRequest,
    PaymentRequestStatus,
)
from apps.reporting import services
from apps.vendors.models import Project, Vendor


class ReportingServicesTestCase(TestCase):
    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="emp_rep_svc", role=UserRole.EMPLOYEE
        )
        self.vendor = Vendor.objects.create(name="Apex Quarry Ltd")
        self.project1 = Project.objects.create(
            name="Naivasha Industrial Park", code="PRJ-NIV-01"
        )
        self.project2 = Project.objects.create(name="Nakuru Bypass", code="PRJ-NKU-02")

    def test_summary_report_empty(self) -> None:
        summary = services.get_payment_summary_report()
        self.assertEqual(summary["total_paid"], "0.00")
        self.assertEqual(summary["paid_count"], 0)
        self.assertEqual(summary["awaiting_approval_count"], 0)
        self.assertEqual(summary["failed_count"], 0)
        self.assertEqual(summary["total_failed"], "0.00")

    def test_summary_report_with_diverse_statuses(self) -> None:
        # Paid payment
        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project1,
            requester=self.employee,
            amount=Decimal("150000.50"),
            invoice_number="INV-REP-01",
            description="Crushed stone",
            status=PaymentRequestStatus.PAID,
            created_by=self.employee.id,
        )
        # Another paid payment
        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project2,
            requester=self.employee,
            amount=Decimal("50000.25"),
            invoice_number="INV-REP-02",
            description="Sand delivery",
            status=PaymentRequestStatus.PAID,
            created_by=self.employee.id,
        )
        # Submitted (awaiting approval)
        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project1,
            requester=self.employee,
            amount=Decimal("20000.00"),
            invoice_number="INV-REP-03",
            description="Ballast",
            status=PaymentRequestStatus.SUBMITTED,
            created_by=self.employee.id,
        )
        # Pending approval (awaiting finance tier)
        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project2,
            requester=self.employee,
            amount=Decimal("80000.00"),
            invoice_number="INV-REP-04",
            description="Hardcore",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        # Failed payment
        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project1,
            requester=self.employee,
            amount=Decimal("35000.00"),
            invoice_number="INV-REP-05",
            description="Failed delivery",
            status=PaymentRequestStatus.FAILED,
            created_by=self.employee.id,
        )

        summary = services.get_payment_summary_report()
        self.assertEqual(summary["total_paid"], "200000.75")
        self.assertEqual(summary["paid_count"], 2)
        self.assertEqual(summary["awaiting_approval_count"], 2)
        self.assertEqual(summary["failed_count"], 1)
        self.assertEqual(summary["total_failed"], "35000.00")

    def test_summary_report_date_filtering(self) -> None:
        now = timezone.now()
        yesterday = now - timedelta(days=1)
        two_days_ago = now - timedelta(days=2)

        p = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("5000.00"),
            invoice_number="INV-DATE-01",
            description="Old payment",
            status=PaymentRequestStatus.PAID,
            created_by=self.employee.id,
        )
        # Update created_at timestamp explicitly
        PaymentRequest.objects.filter(id=p.id).update(created_at=two_days_ago)

        # Filter excluding old payment
        summary = services.get_payment_summary_report(start_date=yesterday)
        self.assertEqual(summary["paid_count"], 0)

        # Filter including old payment
        summary_all = services.get_payment_summary_report(
            start_date=two_days_ago - timedelta(hours=1)
        )
        self.assertEqual(summary_all["paid_count"], 1)

    def test_project_breakdown_report(self) -> None:
        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project1,
            requester=self.employee,
            amount=Decimal("75000.00"),
            invoice_number="INV-PRJ-01",
            description="Project 1 payment",
            status=PaymentRequestStatus.PAID,
            created_by=self.employee.id,
        )
        # Unassigned project payment
        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=None,
            requester=self.employee,
            amount=Decimal("25000.00"),
            invoice_number="INV-NOPRJ-01",
            description="General admin supply",
            status=PaymentRequestStatus.PAID,
            created_by=self.employee.id,
        )

        breakdown = services.get_project_breakdown_report()
        project_names = [b["name"] for b in breakdown]
        self.assertIn("Naivasha Industrial Park", project_names)
        self.assertIn("Nakuru Bypass", project_names)
        self.assertIn("General Operations (No Project)", project_names)

        # Check Nakuru Bypass has 0.00 paid
        nakuru = next(b for b in breakdown if b["name"] == "Nakuru Bypass")
        self.assertEqual(nakuru["total_paid"], "0.00")
        self.assertEqual(nakuru["request_count"], 0)

        # Check Naivasha has 75000.00 paid
        naivasha = next(b for b in breakdown if b["name"] == "Naivasha Industrial Park")
        self.assertEqual(naivasha["total_paid"], "75000.00")
        self.assertEqual(naivasha["request_count"], 1)
