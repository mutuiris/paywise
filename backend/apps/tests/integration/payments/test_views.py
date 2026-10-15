"""Integration tests for payment request listing, search, and detail views."""

from __future__ import annotations

import uuid
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


class PaymentViewsIntegrationTests(TestCase):
    """Integration test suite for payment request HTTP API endpoints."""

    def setUp(self) -> None:
        self.client = Client()

        self.finance_user = UserAccount.objects.create_user(
            username="finance_officer_faith",
            email="faith@example.com",
            role=UserRole.FINANCE_OFFICER,
        )
        self.employee1 = UserAccount.objects.create_user(
            username="employee_alice",
            email="alice@example.com",
            role=UserRole.EMPLOYEE,
        )
        self.employee2 = UserAccount.objects.create_user(
            username="employee_brian",
            email="brian@example.com",
            role=UserRole.EMPLOYEE,
        )

        self.vendor = Vendor.objects.create(
            name="Safaricom Telecommunications",
            email="safaricom@example.com",
            payment_details={"kra_pin": "P051234567X", "bank": "0110901234567"},
        )
        self.project = Project.objects.create(
            name="Infrastructure Upgrade",
            code="PRJ-INFRA",
        )

        self.req1 = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project,
            requester=self.employee1,
            created_by=self.employee1.id,
            amount=Decimal("35000.00"),
            currency="KES",
            invoice_number="INV-2026-001",
            description="Fibre optic cabling installation",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.PENDING_APPROVAL,
        )
        self.req2 = PaymentRequest.objects.create(
            vendor=self.vendor,
            project=self.project,
            requester=self.employee2,
            created_by=self.employee2.id,
            amount=Decimal("75000.00"),
            currency="KES",
            invoice_number="INV-2026-002",
            description="Data center rack cooling units",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.APPROVED,
        )

        self.list_url = reverse("payments:payment-request-list")
        self.search_url = reverse("payments:payment-request-search")

    def test_unauthenticated_request_returns_401(self) -> None:
        """Anonymous access to payment endpoints returns HTTP 401 Unauthorized."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 401)

    def test_employee_search_is_scoped_to_own_requests(self) -> None:
        """Employees can only retrieve requests they created/requested."""
        self.client.force_login(self.employee1)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["id"], str(self.req1.id))

    def test_finance_officer_can_search_all_requests_with_query_params(self) -> None:
        """Finance officers query all organization requests using composable filters."""
        self.client.force_login(self.finance_user)

        response = self.client.get(
            self.search_url,
            {"status": "APPROVED", "q": "cooling"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["id"], str(self.req2.id))

    def test_invalid_filter_param_returns_400(self) -> None:
        """Malformed query parameters return HTTP 400 Bad Request."""
        self.client.force_login(self.finance_user)

        response = self.client.get(
            self.search_url,
            {"date_from": "not-a-valid-date"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())

    def test_payment_request_detail_view_permissions(self) -> None:
        """Verifies detail endpoint authorization rules."""
        detail_url1 = reverse(
            "payments:payment-request-detail", kwargs={"pk": self.req1.id}
        )

        # Alice views her own request
        self.client.force_login(self.employee1)
        res_alice = self.client.get(detail_url1)
        self.assertEqual(res_alice.status_code, 200)
        self.assertEqual(res_alice.json()["id"], str(self.req1.id))

        # Brian is forbidden from viewing Alice's request
        self.client.force_login(self.employee2)
        res_brian = self.client.get(detail_url1)
        self.assertEqual(res_brian.status_code, 403)

        # Finance officer can view Alice's request
        self.client.force_login(self.finance_user)
        res_finance = self.client.get(detail_url1)
        self.assertEqual(res_finance.status_code, 200)

        # Non-existent UUID returns 404
        non_existent_url = reverse(
            "payments:payment-request-detail", kwargs={"pk": uuid.uuid4()}
        )
        res_404 = self.client.get(non_existent_url)
        self.assertEqual(res_404.status_code, 404)
