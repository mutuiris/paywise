"""Integration tests for payment request HTTP JSON API endpoints."""

from __future__ import annotations

import json
from decimal import Decimal

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import UserAccount, UserRole
from apps.approvals import services as approval_services
from apps.approvals.models import ApprovalDecision, ApprovalTier
from apps.payments import services
from apps.payments.models import (
    PaymentAttemptStatus,
    PaymentMethod,
    PaymentRequestStatus,
)
from apps.vendors.models import Project, Vendor


class PaymentViewsTestCase(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.employee1 = UserAccount.objects.create_user(
            username="emp1_view", role=UserRole.EMPLOYEE
        )
        self.employee2 = UserAccount.objects.create_user(
            username="emp2_view", role=UserRole.EMPLOYEE
        )
        self.manager = UserAccount.objects.create_user(
            username="mgr1_view", role=UserRole.MANAGER
        )
        self.finance = UserAccount.objects.create_user(
            username="fin1_view", role=UserRole.FINANCE_OFFICER
        )
        self.admin = UserAccount.objects.create_user(
            username="adm1_view", role=UserRole.ADMINISTRATOR
        )

        self.vendor = Vendor.objects.create(
            name="Imara Timber Supplies",
            payment_details={"paybill": "112233", "account": "TIMBER"},
        )
        self.project = Project.objects.create(
            name="Mombasa Residential Complex", code="PRJ-MSA-01"
        )

        # Create sample payment request owned by employee1
        self.req1 = services.create_payment_request(
            actor=self.employee1,
            vendor_id=self.vendor.id,
            project_id=self.project.id,
            amount=Decimal("40000.00"),
            invoice_number="INV-TIMBER-101",
            description="Treated structural timber",
        )

        # Create sample payment request owned by employee2
        self.req2 = services.create_payment_request(
            actor=self.employee2,
            vendor_id=self.vendor.id,
            amount=Decimal("15000.00"),
            invoice_number="INV-TIMBER-102",
            description="Wood varnish and nails",
        )

    def test_list_payments_unauthenticated(self) -> None:
        response = self.client.get(reverse("payments:list-create"))
        self.assertEqual(response.status_code, 401)

    def test_list_payments_employee_sees_only_own(self) -> None:
        self.client.force_login(self.employee1)
        response = self.client.get(reverse("payments:list-create"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        ids = [item["id"] for item in data["results"]]
        self.assertIn(str(self.req1.id), ids)
        self.assertNotIn(str(self.req2.id), ids)

    def test_list_payments_finance_and_manager_see_all(self) -> None:
        self.client.force_login(self.finance)
        resp_fin = self.client.get(reverse("payments:list-create"))
        self.assertEqual(resp_fin.status_code, 200)
        fin_ids = [item["id"] for item in resp_fin.json()["results"]]
        self.assertIn(str(self.req1.id), fin_ids)
        self.assertIn(str(self.req2.id), fin_ids)

        self.client.force_login(self.manager)
        resp_mgr = self.client.get(reverse("payments:list-create"))
        self.assertEqual(resp_mgr.status_code, 200)
        self.assertGreaterEqual(resp_mgr.json()["count"], 2)

    def test_list_payments_filtering_by_vendor_and_status(self) -> None:
        self.client.force_login(self.finance)
        response = self.client.get(
            reverse("payments:list-create"),
            {"vendor": str(self.vendor.id), "status": PaymentRequestStatus.DRAFT},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 2)

        # Filter by non-existent status returns empty list
        resp_empty = self.client.get(
            reverse("payments:list-create"),
            {"status": PaymentRequestStatus.PAID},
        )
        self.assertEqual(resp_empty.status_code, 200)
        self.assertEqual(resp_empty.json()["count"], 0)

    def test_create_payment_request_success(self) -> None:
        self.client.force_login(self.employee1)
        payload = {
            "vendor_id": str(self.vendor.id),
            "project_id": str(self.project.id),
            "amount": "28500.00",
            "invoice_number": "INV-API-CREATE-01",
            "description": "Roofing timber",
            "payment_method": PaymentMethod.MPESA,
        }
        response = self.client.post(
            reverse("payments:list-create"),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["payment_request"]["invoice_number"], "INV-API-CREATE-01")
        self.assertEqual(data["payment_request"]["status"], PaymentRequestStatus.DRAFT)
        self.assertEqual(
            data["payment_request"]["requester"]["id"], str(self.employee1.id)
        )

    def test_create_payment_request_duplicate_invoice_returns_409(self) -> None:
        self.client.force_login(self.employee1)
        payload = {
            "vendor_id": str(self.vendor.id),
            "amount": "10000.00",
            "invoice_number": "INV-TIMBER-101",  # already exists for self.vendor
            "description": "Duplicate invoice attempt",
        }
        response = self.client.post(
            reverse("payments:list-create"),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 409)

    def test_detail_view_permissions(self) -> None:
        # Employee 2 cannot view employee 1's request -> 404
        self.client.force_login(self.employee2)
        resp1 = self.client.get(
            reverse("payments:detail-update", kwargs={"payment_id": self.req1.id})
        )
        self.assertEqual(resp1.status_code, 404)

        # Employee 1 can view own request
        self.client.force_login(self.employee1)
        resp2 = self.client.get(
            reverse("payments:detail-update", kwargs={"payment_id": self.req1.id})
        )
        self.assertEqual(resp2.status_code, 200)

        # Finance can view any request
        self.client.force_login(self.finance)
        resp3 = self.client.get(
            reverse("payments:detail-update", kwargs={"payment_id": self.req1.id})
        )
        self.assertEqual(resp3.status_code, 200)

    def test_submit_view(self) -> None:
        self.client.force_login(self.employee1)
        url = reverse("payments:submit", kwargs={"payment_id": self.req1.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()["payment_request"]["status"],
            PaymentRequestStatus.SUBMITTED,
        )

    def test_process_payment_view_success(self) -> None:
        # Submit and approve req1
        services.submit_payment_request(self.req1, actor=self.employee1)
        approval_services.record_approval_decision(
            payment_request_id=self.req1.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        self.req1.refresh_from_db()
        self.assertEqual(self.req1.status, PaymentRequestStatus.APPROVED)

        # Process payment with Idempotency-Key header
        self.client.force_login(self.finance)
        url = reverse("payments:process", kwargs={"payment_id": self.req1.id})
        response = self.client.post(
            url,
            HTTP_IDEMPOTENCY_KEY="idemp-header-api-001",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(
            data["payment_attempt"]["status"], PaymentAttemptStatus.SUCCESS
        )
        self.assertEqual(data["payment_request"]["status"], PaymentRequestStatus.PAID)

        # Idempotent retry with same key returns identical attempt outcome
        retry_response = self.client.post(
            url,
            HTTP_IDEMPOTENCY_KEY="idemp-header-api-001",
        )
        self.assertEqual(retry_response.status_code, 200)
        self.assertEqual(
            retry_response.json()["payment_attempt"]["id"],
            data["payment_attempt"]["id"],
        )

    def test_process_payment_missing_idempotency_key_fails(self) -> None:
        services.submit_payment_request(self.req1, actor=self.employee1)
        approval_services.record_approval_decision(
            payment_request_id=self.req1.id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )
        self.client.force_login(self.finance)
        url = reverse("payments:process", kwargs={"payment_id": self.req1.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Idempotency-Key", response.json()["error"])

    def test_process_payment_forbidden_for_employee(self) -> None:
        self.client.force_login(self.employee1)
        url = reverse("payments:process", kwargs={"payment_id": self.req1.id})
        response = self.client.post(
            url,
            HTTP_IDEMPOTENCY_KEY="key-unauth-test",
        )
        self.assertEqual(response.status_code, 403)
