"""Integration tests for payment request listing, search, and lifecycle views."""

from __future__ import annotations

import json
import uuid
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
        self.manager = UserAccount.objects.create_user(
            username="mgr_payments_view",
            email="mgr@example.com",
            role=UserRole.MANAGER,
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
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 401)

    def test_employee_search_is_scoped_to_own_requests(self) -> None:
        self.client.force_login(self.employee1)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["id"], str(self.req1.id))

    def test_finance_officer_can_search_all_requests_with_query_params(self) -> None:
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
        self.client.force_login(self.finance_user)

        response = self.client.get(
            self.search_url,
            {"date_from": "not-a-valid-date"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())

    def test_payment_request_detail_view_permissions(self) -> None:
        detail_url1 = reverse(
            "payments:payment-request-detail", kwargs={"pk": self.req1.id}
        )

        self.client.force_login(self.employee1)
        res_alice = self.client.get(detail_url1)
        self.assertEqual(res_alice.status_code, 200)
        self.assertEqual(res_alice.json()["id"], str(self.req1.id))

        self.client.force_login(self.employee2)
        res_brian = self.client.get(detail_url1)
        self.assertEqual(res_brian.status_code, 403)

        self.client.force_login(self.finance_user)
        res_finance = self.client.get(detail_url1)
        self.assertEqual(res_finance.status_code, 200)

        non_existent_url = reverse(
            "payments:payment-request-detail", kwargs={"pk": uuid.uuid4()}
        )
        res_404 = self.client.get(non_existent_url)
        self.assertEqual(res_404.status_code, 404)

    def test_create_submit_and_process_payment_request_views(self) -> None:
        self.client.force_login(self.employee1)
        payload = {
            "vendor_id": str(self.vendor.id),
            "project_id": str(self.project.id),
            "amount": "28500.00",
            "invoice_number": "INV-API-CREATE-01",
            "description": "Roofing timber",
            "payment_method": PaymentMethod.MPESA,
        }
        create_resp = self.client.post(
            reverse("payments:list-create"),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(create_resp.status_code, 201)
        created_data = create_resp.json()["payment_request"]
        payment_id = uuid.UUID(created_data["id"])
        self.assertEqual(created_data["status"], PaymentRequestStatus.DRAFT)

        dup_resp = self.client.post(
            reverse("payments:list-create"),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(dup_resp.status_code, 409)

        submit_resp = self.client.post(
            reverse("payments:submit", kwargs={"payment_id": payment_id})
        )
        self.assertEqual(submit_resp.status_code, 200)
        self.assertEqual(
            submit_resp.json()["payment_request"]["status"],
            PaymentRequestStatus.SUBMITTED,
        )

        approval_services.record_approval_decision(
            payment_request_id=payment_id,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )

        self.client.force_login(self.finance_user)
        process_url = reverse("payments:process", kwargs={"payment_id": payment_id})
        missing_key_resp = self.client.post(process_url)
        self.assertEqual(missing_key_resp.status_code, 400)

        proc_resp = self.client.post(
            process_url,
            HTTP_IDEMPOTENCY_KEY="idemp-header-api-001",
        )
        self.assertEqual(proc_resp.status_code, 200)
        self.assertEqual(
            proc_resp.json()["payment_attempt"]["status"],
            PaymentAttemptStatus.SUCCESS,
        )
        self.assertEqual(
            proc_resp.json()["payment_request"]["status"],
            PaymentRequestStatus.PAID,
        )

        retry_resp = self.client.post(
            process_url,
            HTTP_IDEMPOTENCY_KEY="idemp-header-api-001",
        )
        self.assertEqual(retry_resp.status_code, 200)
        self.assertEqual(
            retry_resp.json()["payment_attempt"]["id"],
            proc_resp.json()["payment_attempt"]["id"],
        )

    def test_process_payment_forbidden_for_employee(self) -> None:
        req = services.create_payment_request(
            actor=self.employee1,
            vendor_id=self.vendor.id,
            amount=Decimal("10000.00"),
            invoice_number="INV-FORBID-PROC",
            description="Test forbidden process",
        )
        self.client.force_login(self.employee1)
        url = reverse("payments:process", kwargs={"payment_id": req.id})
        response = self.client.post(url, HTTP_IDEMPOTENCY_KEY="key-unauth-test")
        self.assertEqual(response.status_code, 403)
