import uuid
from decimal import Decimal

from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.audit.models import AuditAction
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
    query_audit_events,
    record_audit_event,
    sanitize_metadata,
)
from apps.payments.models import PaymentRequest
from apps.vendors.models import Vendor


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
        # Create event
        e1 = log_payment_request_created(self.payment_req, actor=self.employee)
        self.assertEqual(e1.action, AuditAction.PAYMENT_REQUEST_CREATED)
        self.assertEqual(e1.entity_id, self.payment_req.id)
        self.assertEqual(e1.actor_email, self.employee.email)

        # Submit event
        e2 = log_payment_request_submitted(self.payment_req, actor=self.employee)
        self.assertEqual(e2.action, AuditAction.PAYMENT_REQUEST_SUBMITTED)

        # Approve event
        e3 = log_payment_request_approved(
            self.payment_req,
            approver=self.manager,
            tier="MANAGER",
            reason="Verified budget",
        )
        self.assertEqual(e3.action, AuditAction.PAYMENT_REQUEST_APPROVED)
        self.assertEqual(e3.metadata["tier"], "MANAGER")

        # Reject event
        e4 = log_payment_request_rejected(
            self.payment_req,
            rejecter=self.manager,
            reason="Missing proforma invoice",
        )
        self.assertEqual(e4.action, AuditAction.PAYMENT_REQUEST_REJECTED)
        self.assertEqual(e4.metadata["rejection_reason"], "Missing proforma invoice")

        # Processing started event
        attempt_id = uuid.uuid4()
        e5 = log_payment_processing_started(
            self.payment_req,
            actor=self.manager,
            attempt_id=attempt_id,
        )
        self.assertEqual(e5.action, AuditAction.PAYMENT_PROCESSING_STARTED)
        self.assertEqual(e5.metadata["attempt_id"], str(attempt_id))

        # Completed/Paid event
        e6 = log_payment_completed(
            self.payment_req,
            actor=self.manager,
            provider_reference="MPESA-REF-8921",
        )
        self.assertEqual(e6.action, AuditAction.PAYMENT_COMPLETED)
        self.assertEqual(e6.metadata["provider_reference"], "MPESA-REF-8921")

        # Failed event
        e7 = log_payment_failed(
            self.payment_req,
            actor=self.manager,
            failure_reason="Provider timeout",
        )
        self.assertEqual(e7.action, AuditAction.PAYMENT_FAILED)
        self.assertEqual(e7.metadata["failure_reason"], "Provider timeout")

        # Approval invalidated event
        e8 = log_approval_invalidated(
            self.payment_req,
            actor=self.employee,
            reason="Amount increased from 45000 to 60000",
        )
        self.assertEqual(e8.action, AuditAction.APPROVAL_INVALIDATED)

    def test_sensitive_information_redacted_in_metadata(self) -> None:
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
        cleaned = sanitize_metadata(raw_meta)

        self.assertEqual(cleaned["invoice_number"], "INV-SECRET-01")
        self.assertEqual(cleaned["account_number"], "[REDACTED]")
        self.assertEqual(cleaned["auth_token"], "[REDACTED]")
        self.assertEqual(cleaned["card_number"], "[REDACTED]")
        self.assertEqual(cleaned["pin"], "[REDACTED]")
        self.assertEqual(cleaned["nested"]["api_key"], "[REDACTED]")
        self.assertEqual(cleaned["nested"]["safe_info"], "Kenya Shillings")

        # Test persisted through record_audit_event
        event = record_audit_event(
            action=AuditAction.PAYMENT_PROCESSING_STARTED,
            entity_type="PaymentRequest",
            entity_id=self.payment_req.id,
            actor=self.employee,
            metadata=raw_meta,
        )
        self.assertEqual(event.metadata["auth_token"], "[REDACTED]")
        self.assertEqual(event.metadata["pin"], "[REDACTED]")

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
