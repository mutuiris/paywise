"""Unit tests for audit service functionality."""

from __future__ import annotations

import uuid
from decimal import Decimal

from django.db import transaction
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.audit import services
from apps.audit.models import AuditAction, AuditEvent
from apps.audit.services import (
    get_entity_audit_trail,
    log_approval_invalidated,
    log_payment_completed,
    log_payment_failed,
    log_payment_processing_started,
    log_payment_request_approved,
    log_payment_request_created,
    log_payment_request_rejected,
    log_payment_request_submitted,
    log_project_created,
    log_vendor_created,
    query_audit_events,
    record_audit_event,
)
from apps.core.security import sanitise_metadata
from apps.payments.models import PaymentRequest
from apps.vendors.models import Project, Vendor


class AuditServicesUnitTestCase(TestCase):
    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="asrv_emp",
            email="employee@paywise.co.ke",
            role=UserRole.EMPLOYEE,
        )
        self.manager = UserAccount.objects.create_user(
            username="asrv_mgr",
            email="manager@paywise.co.ke",
            role=UserRole.MANAGER,
        )
        self.vendor = Vendor.objects.create(name="Vendor Audit Test")
        self.payment_req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("45000.00"),
            invoice_number="INV-AUDIT-01",
            description="Laptops purchase",
            created_by=self.employee.id,
        )

    def test_all_lifecycle_events_can_be_represented(self) -> None:
        e1 = log_payment_request_created(self.payment_req, actor=self.employee)
        self.assertEqual(e1.action, AuditAction.PAYMENT_REQUEST_CREATED)
        self.assertEqual(e1.entity_id, self.payment_req.id)
        self.assertEqual(e1.actor_email, self.employee.email)

        e2 = log_payment_request_submitted(self.payment_req, actor=self.employee)
        self.assertEqual(e2.action, AuditAction.PAYMENT_REQUEST_SUBMITTED)

        e3 = log_payment_request_approved(
            self.payment_req,
            approver=self.manager,
            tier="MANAGER",
            reason="Verified budget",
        )
        self.assertEqual(e3.action, AuditAction.PAYMENT_REQUEST_APPROVED)
        self.assertEqual(e3.metadata["tier"], "MANAGER")

        e4 = log_payment_request_rejected(
            self.payment_req,
            rejecter=self.manager,
            reason="Missing proforma invoice",
        )
        self.assertEqual(e4.action, AuditAction.PAYMENT_REQUEST_REJECTED)
        self.assertEqual(e4.metadata["rejection_reason"], "Missing proforma invoice")

        attempt_id = uuid.uuid4()
        e5 = log_payment_processing_started(
            self.payment_req,
            actor=self.manager,
            attempt_id=attempt_id,
        )
        self.assertEqual(e5.action, AuditAction.PAYMENT_PROCESSING_STARTED)
        self.assertEqual(e5.metadata["attempt_id"], str(attempt_id))

        e6 = log_payment_completed(
            self.payment_req,
            actor=self.manager,
            provider_reference="MPESA-REF-8921",
        )
        self.assertEqual(e6.action, AuditAction.PAYMENT_COMPLETED)
        self.assertEqual(e6.metadata["provider_reference"], "MPESA-REF-8921")

        e7 = log_payment_failed(
            self.payment_req,
            actor=self.manager,
            failure_reason="Provider timeout",
        )
        self.assertEqual(e7.action, AuditAction.PAYMENT_FAILED)
        self.assertEqual(e7.metadata["failure_reason"], "Provider timeout")

        e8 = log_approval_invalidated(
            self.payment_req,
            actor=self.employee,
            reason="Amount increased from 45000 to 60000",
        )
        self.assertEqual(e8.action, AuditAction.APPROVAL_INVALIDATED)

    def test_sensitive_information_filtered_in_metadata(self) -> None:
        raw_meta = {
            "invoice_number": "INV-SECRET-01",
            "account_number": "011234567890",
            "auth_token": "bearer_jwt_secret_token_123",
            "card_number": "4111111111111234",
            "pin": "1234",
            "nested": {
                "api_key": "live_key_9999",
                "safe_info": "Kenya Shillings",
            },
        }
        cleaned = sanitise_metadata(raw_meta)

        self.assertEqual(cleaned["invoice_number"], "INV-SECRET-01")
        self.assertNotIn("account_number", cleaned)
        self.assertNotIn("auth_token", cleaned)
        self.assertNotIn("card_number", cleaned)
        self.assertNotIn("pin", cleaned)
        self.assertNotIn("api_key", cleaned["nested"])
        self.assertEqual(cleaned["nested"]["safe_info"], "Kenya Shillings")

        event = record_audit_event(
            action=AuditAction.PAYMENT_PROCESSING_STARTED,
            entity_type="PaymentRequest",
            entity_id=self.payment_req.id,
            actor=self.employee,
            metadata=raw_meta,
        )
        self.assertNotIn("auth_token", event.metadata)
        self.assertNotIn("pin", event.metadata)

    def test_entity_audit_trail_and_filtering(self) -> None:
        e1 = log_payment_request_created(self.payment_req, actor=self.employee)
        e2 = log_payment_request_submitted(self.payment_req, actor=self.employee)
        e3 = log_payment_request_approved(
            self.payment_req, approver=self.manager, tier="MANAGER"
        )

        trail = get_entity_audit_trail("PaymentRequest", self.payment_req.id)
        trail_actions = list(trail.values_list("action", flat=True))
        self.assertEqual(
            trail_actions,
            [
                AuditAction.PAYMENT_REQUEST_CREATED,
                AuditAction.PAYMENT_REQUEST_SUBMITTED,
                AuditAction.PAYMENT_REQUEST_APPROVED,
            ],
        )

        filtered = query_audit_events(action=AuditAction.PAYMENT_REQUEST_APPROVED)
        self.assertIn(e3, filtered)
        self.assertNotIn(e1, filtered)
        self.assertNotIn(e2, filtered)

    def test_vendor_and_project_audit_logging(self) -> None:
        vendor = Vendor.objects.create(name="New Audit Vendor")
        ev_v = log_vendor_created(vendor, actor=self.manager)
        self.assertEqual(ev_v.action, AuditAction.VENDOR_CREATED)
        self.assertEqual(ev_v.entity_id, vendor.id)

        project = Project.objects.create(name="Audit Project", code="PRJ-AUDIT")
        ev_p = log_project_created(project, actor=self.manager)
        self.assertEqual(ev_p.action, AuditAction.PROJECT_CREATED)
        self.assertEqual(ev_p.entity_id, project.id)

    def test_query_audit_events_by_actor_and_entity(self) -> None:
        log_payment_request_created(self.payment_req, actor=self.employee)
        log_payment_request_approved(
            self.payment_req, approver=self.manager, tier="MANAGER"
        )

        by_actor = query_audit_events(actor_id=self.employee.id)
        for ev in by_actor:
            self.assertEqual(ev.actor_id, self.employee.id)

        by_entity = query_audit_events(
            entity_type="PaymentRequest", entity_id=self.payment_req.id
        )
        self.assertTrue(by_entity.count() >= 2)

    def test_record_audit_event_without_actor_and_atomic_rollback(self) -> None:
        ev = record_audit_event(
            action=AuditAction.PAYMENT_PROCESSING_STARTED,
            entity_type="PaymentRequest",
            entity_id=self.payment_req.id,
            actor=None,
            description="System-triggered background retry",
        )
        self.assertIsNone(ev.actor)
        self.assertEqual(ev.actor_email, "")
        self.assertIn("System-triggered", ev.description)

        initial_count = AuditEvent.objects.count()
        try:
            with transaction.atomic():
                services.record_event(
                    actor=self.employee,
                    action=AuditAction.PAYMENT_REQUEST_CREATED,
                    entity_type="PaymentRequest",
                    entity_id=self.payment_req.id,
                )
                raise RuntimeError("Simulated failure after audit event creation")
        except RuntimeError:
            pass
        self.assertEqual(AuditEvent.objects.count(), initial_count)
