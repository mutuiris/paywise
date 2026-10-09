import uuid

from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.accounts.models import UserAccount
from apps.audit.models import AuditAction, AuditEvent


class AuditEventModelTestCase(TestCase):
    def setUp(self) -> None:
        self.actor = UserAccount.objects.create_user(username="auditor1")

    def test_create_audit_event(self) -> None:
        target_id = uuid.uuid4()
        event = AuditEvent.objects.create(
            actor=self.actor,
            actor_email=self.actor.email,
            action=AuditAction.PAYMENT_REQUEST_CREATED,
            entity_type="PaymentRequest",
            entity_id=target_id,
            description="Created payment request for INV-2043",
            metadata={"amount": "84500.00", "currency": "KES"},
        )
        self.assertIsInstance(event.id, uuid.UUID)
        self.assertEqual(event.action, AuditAction.PAYMENT_REQUEST_CREATED)
        self.assertEqual(event.entity_id, target_id)
        self.assertIn("PAYMENT_REQUEST_CREATED", str(event))
        self.assertTrue(event.is_active)
        self.assertIsNotNone(event.created_at)

    def test_audit_event_is_immutable_on_update(self) -> None:
        event = AuditEvent.objects.create(
            actor=self.actor,
            action=AuditAction.PAYMENT_REQUEST_SUBMITTED,
            entity_type="PaymentRequest",
            entity_id=uuid.uuid4(),
            description="Submitted request",
        )
        event.description = "Tampered description"
        with self.assertRaises(ValidationError):
            event.save()

    def test_audit_event_cannot_be_deleted(self) -> None:
        event = AuditEvent.objects.create(
            actor=self.actor,
            action=AuditAction.PAYMENT_REQUEST_APPROVED,
            entity_type="PaymentRequest",
            entity_id=uuid.uuid4(),
            description="Approved request",
        )
        with self.assertRaises(ValidationError):
            event.delete()
