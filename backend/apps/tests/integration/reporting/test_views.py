"""Integration tests for reporting HTTP API views."""

from __future__ import annotations

from decimal import Decimal

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import UserAccount, UserRole
from apps.payments.models import (
    PaymentMethod,
    PaymentRequest,
    PaymentRequestStatus,
)
from apps.vendors.models import Project, Vendor


class ReportingViewsIntegrationTests(TestCase):
    """Integration test suite for reporting API endpoints."""

    def setUp(self) -> None:
        self.client = Client()

        self.employee = UserAccount.objects.create_user(
            username="rep_alice",
            role=UserRole.EMPLOYEE,
        )
        self.finance = UserAccount.objects.create_user(
            username="rep_finance",
            role=UserRole.FINANCE_OFFICER,
        )
        self.manager = UserAccount.objects.create_user(
            username="rep_manager",
            role=UserRole.MANAGER,
        )

        self.vendor = Vendor.objects.create(
            name="Apex Engineering Ltd",
            email="apex@example.com",
            payment_details={"kra_pin": "P051234567A"},
        )
        self.project = Project.objects.create(
            name="Power Grid Reinforcement",
            code="PRJ-GRID",
        )

        self.paid_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project,
            requester=self.employee,
            created_by=self.employee.id,
            amount=Decimal("150000.00"),
            invoice_number="INV-GRID-001",
            description="Transformer substation cabling",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.PAID,
        )

        self.failed_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project,
            requester=self.employee,
            created_by=self.employee.id,
            amount=Decimal("25000.00"),
            invoice_number="INV-GRID-002",
            description="Inspection meter calibrator",
            payment_method=PaymentMethod.MPESA,
            status=PaymentRequestStatus.FAILED,
            rejection_reason="Mobile money transaction limit exceeded.",
        )

        self.summary_url = reverse("reporting:activity-summary")
        self.failed_url = reverse("reporting:failed-payments")
        self.by_project_url = reverse("reporting:projects-breakdown")

    def test_unauthenticated_requests_return_401(self) -> None:
        for url in (self.summary_url, self.failed_url, self.by_project_url):
            res = self.client.get(url)
            self.assertEqual(res.status_code, 401)

    def test_employee_access_returns_403(self) -> None:
        self.client.force_login(self.employee)
        for url in (self.summary_url, self.failed_url, self.by_project_url):
            res = self.client.get(url)
            self.assertEqual(res.status_code, 403)

    def test_manager_and_finance_can_access_summary(self) -> None:
        self.client.force_login(self.finance)
        res = self.client.get(self.summary_url)
        self.assertEqual(res.status_code, 200)

        data = res.json()
        self.assertEqual(data["total_paid_amount"], "150000.00")
        self.assertEqual(data["total_paid_count"], 1)
        self.assertEqual(data["failed_payment_count"], 1)
        self.assertEqual(data["failed_payment_amount"], "25000.00")

    def test_failed_payments_endpoint(self) -> None:
        self.client.force_login(self.finance)
        res = self.client.get(self.failed_url)
        self.assertEqual(res.status_code, 200)

        data = res.json()
        self.assertEqual(data["total_failed_count"], 1)
        self.assertEqual(
            data["results"][0]["failure_reason"],
            "Mobile money transaction limit exceeded.",
        )

    def test_projects_breakdown_endpoint(self) -> None:
        self.client.force_login(self.manager)
        res = self.client.get(self.by_project_url)
        self.assertEqual(res.status_code, 200)

        data = res.json()
        self.assertEqual(data["count"], 1)
        proj = data["results"][0]
        self.assertEqual(proj["project_code"], "PRJ-GRID")
        self.assertEqual(proj["paid_amount"], "150000.00")

    def test_invalid_date_returns_400(self) -> None:
        self.client.force_login(self.finance)
        for url in (self.summary_url, self.failed_url, self.by_project_url):
            res = self.client.get(url, {"date_from": "bad-date"})
            self.assertEqual(res.status_code, 400)
            self.assertIn("detail", res.json())
