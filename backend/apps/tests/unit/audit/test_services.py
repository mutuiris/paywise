"""Unit tests for audit service functionality."""

from __future__ import annotations

import uuid

from django.db import transaction
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.audit import services
from apps.audit.models import AuditAction, AuditEvent


class AuditServicesTestCase(TestCase):
    def setUp(self) -> None:
        self.actor = UserAccount.objects.create_user(
            username="audit_actor",
            email="actor@imaraworks.co.ke",
            role=UserRole.EMPLOYEE,
        )
        self.entity_id = uuid.uuid4()

    def test_record_event_basic(self) -> None:
        event = services.record_event(
            actor=self.actor,
            action=AuditAction.PAYMENT_REQUEST_CREATED,
            entity_type="PaymentRequest",
            entity_id=self.entity_id,
            description="Created draft request",
            metadata={"invoice_number": "INV-001", "amount": "12000.00"},
        )
        self.assertIsInstance(event.id, uuid.UUID)
        self.assertEqual(event.actor, self.actor)
        self.assertEqual(event.actor_email, self.actor.email)
        self.assertEqual(event.action, AuditAction.PAYMENT_REQUEST_CREATED)
        self.assertEqual(event.entity_id, self.entity_id)
        self.assertEqual(event.entity_type, "PaymentRequest")
        self.assertEqual(event.metadata["invoice_number"], "INV-001")

    def test_record_event_without_actor(self) -> None:
        event = services.record_event(
            actor=None,
            action=AuditAction.PAYMENT_COMPLETED,
            entity_type="PaymentRequest",
            entity_id=self.entity_id,
            description="System completed payment",
        )
        self.assertIsNone(event.actor)
        self.assertEqual(event.actor_email, "")
        self.assertEqual(event.action, AuditAction.PAYMENT_COMPLETED)

    def test_sanitises_sensitive_metadata(self) -> None:
        raw_metadata = {
            "invoice_number": "INV-SAFE-10",
            "amount": "5000.00",
            "password": "super-secret-password",
            "token": "bearer-token-12345",
            "authorization": "Bearer xyz",
            "cookie": "sessionid=secret",
            "api_key": "key-secret-999",
            "cvv": "123",
            "pin": "9999",
        }
        event = services.record_event(
            actor=self.actor,
            action=AuditAction.PAYMENT_REQUEST_CREATED,
            entity_type="PaymentRequest",
            entity_id=self.entity_id,
            metadata=raw_metadata,
        )
        self.assertEqual(event.metadata["invoice_number"], "INV-SAFE-10")
        self.assertEqual(event.metadata["amount"], "5000.00")
        self.assertNotIn("password", event.metadata)
        self.assertNotIn("token", event.metadata)
        self.assertNotIn("authorization", event.metadata)
        self.assertNotIn("cookie", event.metadata)
        self.assertNotIn("api_key", event.metadata)
        self.assertNotIn("cvv", event.metadata)
        self.assertNotIn("pin", event.metadata)

    def test_record_payment_request_lifecycle_helpers(self) -> None:
        e1 = services.record_payment_request_created(
            actor=self.actor,
            payment_request_id=self.entity_id,
        )
        self.assertEqual(e1.action, AuditAction.PAYMENT_REQUEST_CREATED)

        e2 = services.record_payment_request_submitted(
            actor=self.actor,
            payment_request_id=self.entity_id,
        )
        self.assertEqual(e2.action, AuditAction.PAYMENT_REQUEST_SUBMITTED)

        e3 = services.record_payment_request_approved(
            actor=self.actor,
            payment_request_id=self.entity_id,
            tier="MANAGER",
        )
        self.assertEqual(e3.action, AuditAction.PAYMENT_REQUEST_APPROVED)

        e4 = services.record_payment_request_rejected(
            actor=self.actor,
            payment_request_id=self.entity_id,
            tier="MANAGER",
            reason="Budget exceeded",
        )
        self.assertEqual(e4.action, AuditAction.PAYMENT_REQUEST_REJECTED)
        self.assertIn("Budget exceeded", e4.description)

        e5 = services.record_payment_processing_started(
            actor=self.actor,
            payment_request_id=self.entity_id,
        )
        self.assertEqual(e5.action, AuditAction.PAYMENT_PROCESSING_STARTED)

        e6 = services.record_payment_completed(
            actor=self.actor,
            payment_request_id=self.entity_id,
        )
        self.assertEqual(e6.action, AuditAction.PAYMENT_COMPLETED)

        e7 = services.record_payment_failed(
            actor=self.actor,
            payment_request_id=self.entity_id,
            reason="Insufficient balance",
        )
        self.assertEqual(e7.action, AuditAction.PAYMENT_FAILED)

        e8 = services.record_approval_invalidated(
            actor=self.actor,
            payment_request_id=self.entity_id,
        )
        self.assertEqual(e8.action, AuditAction.APPROVAL_INVALIDATED)

    def test_atomic_rollback_on_failure(self) -> None:
        initial_count = AuditEvent.objects.count()
        try:
            with transaction.atomic():
                services.record_event(
                    actor=self.actor,
                    action=AuditAction.PAYMENT_REQUEST_CREATED,
                    entity_type="PaymentRequest",
                    entity_id=self.entity_id,
                )
                raise RuntimeError("Simulated failure after audit event creation")
        except RuntimeError:
            pass

        self.assertEqual(AuditEvent.objects.count(), initial_count)
