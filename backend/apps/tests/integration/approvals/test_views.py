"""Integration tests for approval decision HTTP JSON API views."""

from __future__ import annotations

import json
import uuid
from decimal import Decimal

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import UserAccount, UserRole
from apps.approvals.models import ApprovalDecision, ApprovalTier
from apps.payments.models import PaymentRequest, PaymentRequestStatus
from apps.vendors.models import Vendor


class ApprovalViewsIntegrationTestCase(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.employee = UserAccount.objects.create_user(
            username="view_emp",
            password="password123",
            role=UserRole.EMPLOYEE,
        )
        self.manager = UserAccount.objects.create_user(
            username="view_mgr",
            password="password123",
            role=UserRole.MANAGER,
        )
        self.finance = UserAccount.objects.create_user(
            username="view_fin",
            password="password123",
            role=UserRole.FINANCE_OFFICER,
        )
        self.vendor = Vendor.objects.create(name="Vendor View Test")
        self.payment_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("40000.00"),
            invoice_number="INV-VIEW-01",
            description="Office stationery and consumables",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        self.high_val_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("150000.00"),
            invoice_number="INV-VIEW-02",
            description="Enterprise server rack",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )

    def test_queue_endpoint_requires_authentication(self) -> None:
        url = reverse("approvals:approval-queue")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    def test_queue_endpoint_returns_eligible_requests_for_manager(self) -> None:
        self.client.force_login(self.manager)
        url = reverse("approvals:approval-queue")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("results", data)
        req_ids = [r["id"] for r in data["results"]]
        self.assertIn(str(self.payment_req.id), req_ids)
        self.assertIn(str(self.high_val_req.id), req_ids)

    def test_detail_endpoint_returns_approval_metadata_and_404_when_missing(
        self,
    ) -> None:
        self.client.force_login(self.manager)
        url = reverse("approvals:approval-detail", args=[self.high_val_req.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["invoice_number"], "INV-VIEW-02")
        self.assertEqual(
            data["required_tiers"], [ApprovalTier.MANAGER, ApprovalTier.FINANCE]
        )
        self.assertEqual(data["approved_tiers"], [])
        self.assertEqual(
            data["pending_tiers"], [ApprovalTier.MANAGER, ApprovalTier.FINANCE]
        )
        self.assertFalse(data["is_fully_approved"])

        missing_url = reverse("approvals:approval-detail", args=[uuid.uuid4()])
        missing_resp = self.client.get(missing_url)
        self.assertEqual(missing_resp.status_code, 404)

    def test_detail_endpoint_hidden_from_other_employees(self) -> None:
        url = reverse("approvals:approval-detail", args=[self.payment_req.id])
        self.client.force_login(self.employee)
        self.assertEqual(self.client.get(url).status_code, 200)

        outsider = UserAccount.objects.create_user(
            username="view_outsider", role=UserRole.EMPLOYEE
        )
        self.client.force_login(outsider)
        self.assertEqual(self.client.get(url).status_code, 403)

    def test_approve_endpoint_manager_success_low_value(self) -> None:
        self.client.force_login(self.manager)
        url = reverse("approvals:approval-approve", args=[self.payment_req.id])
        response = self.client.post(
            url,
            data=json.dumps({"reason": "Budget verified and approved"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["payment_request_status"], PaymentRequestStatus.APPROVED)
        self.assertTrue(data["is_fully_approved"])
        self.assertEqual(data["approval"]["decision"], ApprovalDecision.APPROVED)
        self.assertEqual(data["approval"]["tier"], ApprovalTier.MANAGER)

    def test_approve_endpoint_prevents_self_approval(self) -> None:
        self.client.force_login(self.employee)
        url = reverse("approvals:approval-approve", args=[self.payment_req.id])
        response = self.client.post(
            url,
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_approve_endpoint_prevents_employee_approval(self) -> None:
        other_employee = UserAccount.objects.create_user(
            username="other_emp",
            password="password123",
            role=UserRole.EMPLOYEE,
        )
        self.client.force_login(other_employee)
        url = reverse("approvals:approval-approve", args=[self.payment_req.id])
        response = self.client.post(
            url,
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_reject_endpoint_requires_reason(self) -> None:
        self.client.force_login(self.manager)
        url = reverse("approvals:approval-reject", args=[self.payment_req.id])
        response = self.client.post(
            url,
            data=json.dumps({"reason": ""}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.post(
            url,
            data=json.dumps({"reason": "Invalid invoice attachments provided."}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["payment_request_status"], PaymentRequestStatus.REJECTED)
        self.assertEqual(
            data["rejection_reason"], "Invalid invoice attachments provided."
        )

    def test_decide_endpoint_multi_tier_workflow(self) -> None:
        url = reverse("approvals:approval-decide", args=[self.high_val_req.id])

        self.client.force_login(self.manager)
        resp1 = self.client.post(
            url,
            data=json.dumps(
                {"decision": ApprovalDecision.APPROVED, "tier": ApprovalTier.MANAGER}
            ),
            content_type="application/json",
        )
        self.assertEqual(resp1.status_code, 201)
        self.assertEqual(
            resp1.json()["payment_request_status"],
            PaymentRequestStatus.PENDING_APPROVAL,
        )
        self.assertFalse(resp1.json()["is_fully_approved"])

        self.client.force_login(self.finance)
        resp2 = self.client.post(
            url,
            data=json.dumps(
                {"decision": ApprovalDecision.APPROVED, "tier": ApprovalTier.FINANCE}
            ),
            content_type="application/json",
        )
        self.assertEqual(resp2.status_code, 201)
        self.assertEqual(
            resp2.json()["payment_request_status"], PaymentRequestStatus.APPROVED
        )
        self.assertTrue(resp2.json()["is_fully_approved"])
