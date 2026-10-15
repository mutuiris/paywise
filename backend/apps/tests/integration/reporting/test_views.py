"""Integration tests for reporting HTTP JSON API views."""

from __future__ import annotations

from decimal import Decimal

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import UserAccount, UserRole
from apps.payments.models import (
    PaymentRequest,
    PaymentRequestStatus,
)
from apps.vendors.models import Project, Vendor


class ReportingViewsTestCase(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.employee = UserAccount.objects.create_user(
            username="emp_rep_view", role=UserRole.EMPLOYEE
        )
        self.manager = UserAccount.objects.create_user(
            username="mgr_rep_view", role=UserRole.MANAGER
        )
        self.finance = UserAccount.objects.create_user(
            username="fin_rep_view", role=UserRole.FINANCE_OFFICER
        )

        self.vendor = Vendor.objects.create(name="Nanyuki Builders Supplies")
        self.project = Project.objects.create(
            name="Nanyuki Commercial Hub", code="PRJ-NYK-01"
        )

        PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project,
            requester=self.employee,
            amount=Decimal("64000.00"),
            invoice_number="INV-NYK-01",
            description="Steel rebars",
            status=PaymentRequestStatus.PAID,
            created_by=self.employee.id,
        )

    def test_summary_report_unauthenticated_returns_401(self) -> None:
        response = self.client.get(reverse("reporting:summary"))
        self.assertEqual(response.status_code, 401)

    def test_summary_report_forbidden_for_employee(self) -> None:
        self.client.force_login(self.employee)
        response = self.client.get(reverse("reporting:summary"))
        self.assertEqual(response.status_code, 403)

    def test_summary_report_allowed_for_manager_and_finance(self) -> None:
        self.client.force_login(self.manager)
        resp1 = self.client.get(reverse("reporting:summary"))
        self.assertEqual(resp1.status_code, 200)
        data1 = resp1.json()["summary"]
        self.assertEqual(data1["total_paid"], "64000.00")
        self.assertEqual(data1["paid_count"], 1)

        self.client.force_login(self.finance)
        resp2 = self.client.get(reverse("reporting:summary"))
        self.assertEqual(resp2.status_code, 200)

    def test_summary_report_invalid_date_format_returns_400(self) -> None:
        self.client.force_login(self.finance)
        response = self.client.get(
            reverse("reporting:summary"),
            {"start_date": "not-a-valid-date"},
        )
        self.assertEqual(response.status_code, 400)

    def test_project_breakdown_view_success(self) -> None:
        self.client.force_login(self.finance)
        response = self.client.get(reverse("reporting:projects"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("projects", data)
        self.assertGreaterEqual(len(data["projects"]), 1)
        project_item = next(
            p for p in data["projects"] if p["name"] == "Nanyuki Commercial Hub"
        )
        self.assertEqual(project_item["total_paid"], "64000.00")
