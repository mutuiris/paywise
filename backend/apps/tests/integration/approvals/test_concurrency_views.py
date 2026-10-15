import json
from decimal import Decimal

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import UserAccount, UserRole
from apps.approvals.models import Approval
from apps.payments.models import PaymentRequest, PaymentRequestStatus
from apps.vendors.models import Vendor


class ApprovalConcurrencyViewsIntegrationTestCase(TestCase):
    def setUp(self) -> None:
        self.client1 = Client()
        self.client2 = Client()
        self.employee = UserAccount.objects.create_user(
            username="vconc_emp",
            password="password123",
            role=UserRole.EMPLOYEE,
        )
        self.manager1 = UserAccount.objects.create_user(
            username="vconc_mgr1",
            password="password123",
            role=UserRole.MANAGER,
        )
        self.manager2 = UserAccount.objects.create_user(
            username="vconc_mgr2",
            password="password123",
            role=UserRole.MANAGER,
        )
        self.vendor = Vendor.objects.create(name="Vendor View Concurrency")
        self.payment_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("45000.00"),
            invoice_number="INV-VCONC-01",
            description="Branch internet maintenance",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )

    def test_api_rejects_duplicate_tier_approval(self) -> None:
        self.client1.force_login(self.manager1)
        url = reverse("approvals:approval-approve", args=[self.payment_req.id])
        resp1 = self.client1.post(
            url,
            data=json.dumps({"reason": "Approved by Manager 1"}),
            content_type="application/json",
        )
        self.assertEqual(resp1.status_code, 201)

        # Manager 2 attempts to approve the same manager tier
        self.client2.force_login(self.manager2)
        resp2 = self.client2.post(
            url,
            data=json.dumps({"reason": "Attempted second approval"}),
            content_type="application/json",
        )
        self.assertEqual(resp2.status_code, 400)

    def test_api_rejects_approval_after_rejection(self) -> None:
        self.client1.force_login(self.manager1)
        rej_url = reverse("approvals:approval-reject", args=[self.payment_req.id])
        resp1 = self.client1.post(
            rej_url,
            data=json.dumps({"reason": "Budget limit exceeded."}),
            content_type="application/json",
        )
        self.assertEqual(resp1.status_code, 201)

        # Attempt to approve after rejection
        self.client2.force_login(self.manager2)
        app_url = reverse("approvals:approval-approve", args=[self.payment_req.id])
        resp2 = self.client2.post(
            app_url,
            data=json.dumps({"reason": "Trying to approve rejected item"}),
            content_type="application/json",
        )
        self.assertEqual(resp2.status_code, 400)

    def test_api_update_amount_invalidates_approvals(self) -> None:
        self.client1.force_login(self.manager1)
        app_url = reverse("approvals:approval-approve", args=[self.payment_req.id])
        self.client1.post(
            app_url,
            data=json.dumps({"reason": "Initial approval"}),
            content_type="application/json",
        )
        self.payment_req.refresh_from_db()
        self.assertEqual(self.payment_req.status, PaymentRequestStatus.APPROVED)

        # Update amount via API endpoint
        update_url = reverse(
            "approvals:approval-update-amount", args=[self.payment_req.id]
        )
        resp = self.client1.post(
            update_url,
            data=json.dumps({"amount": "48000.00"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["amount"], "48000.00")
        self.assertEqual(data["status"], PaymentRequestStatus.PENDING_APPROVAL)
        self.assertFalse(data["is_fully_approved"])

        active_approvals = Approval.objects.filter(
            payment_request=self.payment_req, is_active=True
        )
        self.assertEqual(active_approvals.count(), 0)
