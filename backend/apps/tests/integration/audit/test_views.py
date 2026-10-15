"""Integration tests for audit history views."""

from __future__ import annotations

import uuid

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import UserAccount, UserRole
from apps.audit import services
from apps.audit.models import AuditAction


class AuditViewsTestCase(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.employee = UserAccount.objects.create_user(
            username="emp_aud", role=UserRole.EMPLOYEE
        )
        self.finance = UserAccount.objects.create_user(
            username="fin_aud", role=UserRole.FINANCE_OFFICER
        )
        self.admin = UserAccount.objects.create_user(
            username="adm_aud", role=UserRole.ADMINISTRATOR
        )

        self.payment_id = uuid.uuid4()
        services.record_event(
            actor=self.employee,
            action=AuditAction.PAYMENT_REQUEST_CREATED,
            entity_type="PaymentRequest",
            entity_id=self.payment_id,
            description="Created payment request",
        )

    def test_audit_list_requires_authentication(self) -> None:
        response = self.client.get(reverse("audit:audit-list"))
        self.assertEqual(response.status_code, 401)

    def test_audit_list_forbidden_for_employee(self) -> None:
        self.client.force_login(self.employee)
        response = self.client.get(reverse("audit:audit-list"))
        self.assertEqual(response.status_code, 403)

    def test_audit_list_allowed_for_finance_and_admin(self) -> None:
        self.client.force_login(self.finance)
        resp1 = self.client.get(reverse("audit:audit-list"))
        self.assertEqual(resp1.status_code, 200)
        data = resp1.json()
        self.assertGreaterEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["entity_id"], str(self.payment_id))

        self.client.force_login(self.admin)
        resp2 = self.client.get(reverse("audit:audit-list"))
        self.assertEqual(resp2.status_code, 200)

    def test_audit_list_filtering(self) -> None:
        self.client.force_login(self.finance)
        resp = self.client.get(
            reverse("audit:audit-list"), {"entity_id": str(self.payment_id)}
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()["results"]), 1)

        resp2 = self.client.get(
            reverse("audit:audit-list"), {"entity_id": str(uuid.uuid4())}
        )
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(len(resp2.json()["results"]), 0)

    def test_audit_list_invalid_uuid(self) -> None:
        self.client.force_login(self.finance)
        resp = self.client.get(
            reverse("audit:audit-list"), {"entity_id": "not-a-valid-uuid"}
        )
        self.assertEqual(resp.status_code, 400)
