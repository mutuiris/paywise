"""Integration tests for audit history views."""

from __future__ import annotations

import uuid
from decimal import Decimal

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import UserAccount, UserRole
from apps.approvals.models import ApprovalDecision, ApprovalTier
from apps.approvals.services import record_approval
from apps.audit.models import AuditAction
from apps.payments.models import PaymentRequest, PaymentRequestStatus
from apps.vendors.models import Vendor


class AuditViewsIntegrationTestCase(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.employee = UserAccount.objects.create_user(
            username="aview_emp",
            password="password123",
            role=UserRole.EMPLOYEE,
        )
        self.manager = UserAccount.objects.create_user(
            username="aview_mgr",
            password="password123",
            role=UserRole.MANAGER,
        )
        self.finance = UserAccount.objects.create_user(
            username="aview_fin",
            password="password123",
            role=UserRole.FINANCE_OFFICER,
        )
        self.vendor = Vendor.objects.create(name="Vendor View Audit")
        self.payment_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("40000.00"),
            invoice_number="INV-AVIEW-01",
            description="Branch supplies",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )

    def test_audit_list_requires_authentication(self) -> None:
        url = reverse("audit:audit-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    def test_audit_list_forbidden_for_employee(self) -> None:
        self.client.force_login(self.employee)
        url = reverse("audit:audit-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_audit_list_accessible_to_manager_and_finance(self) -> None:
        record_approval(
            payment_request=self.payment_req,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
            reason="Verified and approved",
        )

        self.client.force_login(self.manager)
        url = reverse("audit:audit-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("results", data)
        self.assertGreaterEqual(data["count"], 1)

        actions = [r["action"] for r in data["results"]]
        self.assertIn(AuditAction.PAYMENT_REQUEST_APPROVED, actions)

        invalid_resp = self.client.get(url, {"entity_id": "not-a-valid-uuid"})
        self.assertEqual(invalid_resp.status_code, 400)

        empty_resp = self.client.get(url, {"entity_id": str(uuid.uuid4())})
        self.assertEqual(empty_resp.status_code, 200)
        self.assertEqual(empty_resp.json()["count"], 0)

    def test_entity_audit_trail_view(self) -> None:
        record_approval(
            payment_request=self.payment_req,
            approver=self.manager,
            tier=ApprovalTier.MANAGER,
            decision=ApprovalDecision.APPROVED,
        )

        self.client.force_login(self.finance)
        url = reverse(
            "audit:audit-entity-trail",
            args=["PaymentRequest", self.payment_req.id],
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["entity_type"], "PaymentRequest")
        self.assertEqual(data["entity_id"], str(self.payment_req.id))
        self.assertGreaterEqual(data["count"], 1)
        self.assertEqual(
            data["events"][0]["action"], AuditAction.PAYMENT_REQUEST_APPROVED
        )
