"""Integration tests for approval decision HTTP JSON API views."""

from __future__ import annotations

import json
import uuid
from decimal import Decimal

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import UserAccount, UserRole
from apps.approvals.models import ApprovalDecision, ApprovalTier
from apps.payments.models import (
    PaymentMethod,
    PaymentRequest,
    PaymentRequestStatus,
)
from apps.vendors.models import Vendor


class ApprovalViewsTestCase(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.employee = UserAccount.objects.create_user(
            username="emp_view_app", role=UserRole.EMPLOYEE
        )
        self.manager = UserAccount.objects.create_user(
            username="mgr_view_app", role=UserRole.MANAGER
        )
        self.finance = UserAccount.objects.create_user(
            username="fin_view_app", role=UserRole.FINANCE_OFFICER
        )
        self.vendor = Vendor.objects.create(name="Coast Concrete Works")

        self.payment_under_50k = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("35000.00"),
            invoice_number="INV-VIEW-01",
            description="Foundation materials",
            payment_method=PaymentMethod.MPESA,
            status=PaymentRequestStatus.SUBMITTED,
            created_by=self.employee.id,
        )

        self.payment_over_50k = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("120000.00"),
            invoice_number="INV-VIEW-02",
            description="Steel girders",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.SUBMITTED,
            created_by=self.employee.id,
        )

    def test_get_approvals_unauthenticated(self) -> None:
        url = reverse(
            "approvals:decisions",
            kwargs={"payment_request_id": self.payment_under_50k.id},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    def test_get_approvals_not_found(self) -> None:
        self.client.force_login(self.manager)
        url = reverse(
            "approvals:decisions", kwargs={"payment_request_id": uuid.uuid4()}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_manager_approves_under_threshold_becomes_approved(self) -> None:
        self.client.force_login(self.manager)
        url = reverse(
            "approvals:decisions",
            kwargs={"payment_request_id": self.payment_under_50k.id},
        )
        response = self.client.post(
            url,
            data=json.dumps(
                {"tier": ApprovalTier.MANAGER, "decision": ApprovalDecision.APPROVED}
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["approval"]["decision"], ApprovalDecision.APPROVED)
        self.assertEqual(data["payment_request_status"], PaymentRequestStatus.APPROVED)

    def test_manager_approves_over_threshold_remains_pending_finance(self) -> None:
        self.client.force_login(self.manager)
        url = reverse(
            "approvals:decisions",
            kwargs={"payment_request_id": self.payment_over_50k.id},
        )
        resp1 = self.client.post(
            url,
            data=json.dumps(
                {"tier": ApprovalTier.MANAGER, "decision": ApprovalDecision.APPROVED}
            ),
            content_type="application/json",
        )
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(
            resp1.json()["payment_request_status"],
            PaymentRequestStatus.PENDING_APPROVAL,
        )

        # Finance officer approves second tier
        self.client.force_login(self.finance)
        resp2 = self.client.post(
            url,
            data=json.dumps(
                {"tier": ApprovalTier.FINANCE, "decision": ApprovalDecision.APPROVED}
            ),
            content_type="application/json",
        )
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(
            resp2.json()["payment_request_status"], PaymentRequestStatus.APPROVED
        )

    def test_finance_before_manager_rejected(self) -> None:
        self.client.force_login(self.finance)
        url = reverse(
            "approvals:decisions",
            kwargs={"payment_request_id": self.payment_over_50k.id},
        )
        response = self.client.post(
            url,
            data=json.dumps(
                {"tier": ApprovalTier.FINANCE, "decision": ApprovalDecision.APPROVED}
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_self_approval_denied_via_api(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.manager,
            amount=Decimal("15000.00"),
            invoice_number="INV-MGR-SELF",
            description="Manager self request",
            status=PaymentRequestStatus.SUBMITTED,
            created_by=self.manager.id,
        )
        self.client.force_login(self.manager)
        url = reverse("approvals:decisions", kwargs={"payment_request_id": req.id})
        response = self.client.post(
            url,
            data=json.dumps(
                {"tier": ApprovalTier.MANAGER, "decision": ApprovalDecision.APPROVED}
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_rejection_with_reason(self) -> None:
        self.client.force_login(self.manager)
        url = reverse(
            "approvals:decisions",
            kwargs={"payment_request_id": self.payment_under_50k.id},
        )
        response = self.client.post(
            url,
            data=json.dumps(
                {
                    "tier": ApprovalTier.MANAGER,
                    "decision": ApprovalDecision.REJECTED,
                    "reason": "Duplicate invoice reference with existing vendor",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["payment_request_status"], PaymentRequestStatus.REJECTED)

    def test_rejection_without_reason_fails(self) -> None:
        self.client.force_login(self.manager)
        url = reverse(
            "approvals:decisions",
            kwargs={"payment_request_id": self.payment_under_50k.id},
        )
        response = self.client.post(
            url,
            data=json.dumps(
                {
                    "tier": ApprovalTier.MANAGER,
                    "decision": ApprovalDecision.REJECTED,
                    "reason": "",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_employee_cannot_approve(self) -> None:
        self.client.force_login(self.employee)
        url = reverse(
            "approvals:decisions",
            kwargs={"payment_request_id": self.payment_under_50k.id},
        )
        response = self.client.post(
            url,
            data=json.dumps(
                {"tier": ApprovalTier.MANAGER, "decision": ApprovalDecision.APPROVED}
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
