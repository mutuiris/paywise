"""Application services for recording and querying immutable audit events."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from django.db.models import QuerySet

from apps.audit.models import AuditAction, AuditEvent

if TYPE_CHECKING:
    from apps.accounts.models import UserAccount
    from apps.payments.models import PaymentRequest
    from apps.vendors.models import Project, Vendor

SENSITIVE_KEY_PATTERNS = {
    "password",
    "secret",
    "token",
    "cvv",
    "pin",
    "api_key",
    "account_number",
    "card_number",
    "private_key",
    "auth",
}


def sanitize_metadata(data: dict[str, Any] | None) -> dict[str, Any]:
    """Recursively scrub sensitive keys and credentials from audit metadata."""
    if not data or not isinstance(data, dict):
        return {}

    sanitized: dict[str, Any] = {}
    for key, value in data.items():
        lower_key = str(key).lower()
        if any(pat in lower_key for pat in SENSITIVE_KEY_PATTERNS):
            sanitized[key] = "[REDACTED]"
        elif isinstance(value, dict):
            sanitized[key] = sanitize_metadata(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_metadata(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            sanitized[key] = str(value) if isinstance(value, uuid.UUID) else value
    return sanitized


def record_audit_event(
    *,
    action: str,
    entity_type: str,
    entity_id: uuid.UUID,
    actor: UserAccount | None = None,
    actor_email: str = "",
    description: str = "",
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Create and persist an immutable AuditEvent record."""
    resolved_email = actor_email
    if not resolved_email and actor:
        resolved_email = getattr(actor, "email", "") or getattr(actor, "username", "")

    clean_meta = sanitize_metadata(metadata)

    return AuditEvent.objects.create(
        actor=actor,
        actor_email=resolved_email,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
        metadata=clean_meta,
    )


def log_payment_request_created(
    payment_request: PaymentRequest,
    *,
    actor: UserAccount | None = None,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record an audit event for initial payment request creation."""
    meta = {
        "invoice_number": payment_request.invoice_number,
        "amount": str(payment_request.amount),
        "currency": payment_request.currency,
        "vendor_id": str(payment_request.vendor_id),
    }
    if metadata:
        meta.update(metadata)

    return record_audit_event(
        action=AuditAction.PAYMENT_REQUEST_CREATED,
        entity_type="PaymentRequest",
        entity_id=payment_request.id,
        actor=actor,
        description=(
            f"Created payment request for invoice '{payment_request.invoice_number}'."
        ),
        metadata=meta,
    )


def log_payment_request_submitted(
    payment_request: PaymentRequest,
    *,
    actor: UserAccount | None = None,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record an audit event for payment request submission into approval queue."""
    meta = {
        "invoice_number": payment_request.invoice_number,
        "amount": str(payment_request.amount),
    }
    if metadata:
        meta.update(metadata)

    return record_audit_event(
        action=AuditAction.PAYMENT_REQUEST_SUBMITTED,
        entity_type="PaymentRequest",
        entity_id=payment_request.id,
        actor=actor,
        description=(
            f"Submitted payment request '{payment_request.invoice_number}' "
            f"for approval."
        ),
        metadata=meta,
    )


def log_payment_request_approved(
    payment_request: PaymentRequest,
    *,
    approver: UserAccount,
    tier: str,
    reason: str = "",
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record an audit event for an approval tier grant."""
    meta = {
        "tier": tier,
        "amount": str(payment_request.amount),
        "invoice_number": payment_request.invoice_number,
    }
    if reason:
        meta["reason"] = reason
    if metadata:
        meta.update(metadata)

    return record_audit_event(
        action=AuditAction.PAYMENT_REQUEST_APPROVED,
        entity_type="PaymentRequest",
        entity_id=payment_request.id,
        actor=approver,
        description=(
            f"Granted {tier} approval for payment request "
            f"'{payment_request.invoice_number}'."
        ),
        metadata=meta,
    )


def log_payment_request_rejected(
    payment_request: PaymentRequest,
    *,
    rejecter: UserAccount,
    reason: str,
    tier: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record an audit event for a payment request rejection."""
    meta = {
        "rejection_reason": reason,
        "invoice_number": payment_request.invoice_number,
    }
    if tier:
        meta["tier"] = tier
    if metadata:
        meta.update(metadata)

    return record_audit_event(
        action=AuditAction.PAYMENT_REQUEST_REJECTED,
        entity_type="PaymentRequest",
        entity_id=payment_request.id,
        actor=rejecter,
        description=(
            f"Rejected payment request '{payment_request.invoice_number}'. "
            f"Reason: {reason}"
        ),
        metadata=meta,
    )


def log_payment_processing_started(
    payment_request: PaymentRequest,
    *,
    actor: UserAccount | None = None,
    attempt_id: uuid.UUID | None = None,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record an audit event when payment execution starts."""
    meta = {
        "invoice_number": payment_request.invoice_number,
        "amount": str(payment_request.amount),
    }
    if attempt_id:
        meta["attempt_id"] = str(attempt_id)
    if metadata:
        meta.update(metadata)

    return record_audit_event(
        action=AuditAction.PAYMENT_PROCESSING_STARTED,
        entity_type="PaymentRequest",
        entity_id=payment_request.id,
        actor=actor,
        description=(
            f"Started payment processing for invoice "
            f"'{payment_request.invoice_number}'."
        ),
        metadata=meta,
    )


def log_payment_completed(
    payment_request: PaymentRequest,
    *,
    actor: UserAccount | None = None,
    provider_reference: str = "",
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record an audit event when payment execution completes successfully."""
    meta = {
        "invoice_number": payment_request.invoice_number,
        "amount": str(payment_request.amount),
        "status": "PAID",
    }
    if provider_reference:
        meta["provider_reference"] = provider_reference
    if metadata:
        meta.update(metadata)

    return record_audit_event(
        action=AuditAction.PAYMENT_COMPLETED,
        entity_type="PaymentRequest",
        entity_id=payment_request.id,
        actor=actor,
        description=(
            f"Payment completed successfully for invoice "
            f"'{payment_request.invoice_number}'."
        ),
        metadata=meta,
    )


def log_payment_failed(
    payment_request: PaymentRequest,
    *,
    actor: UserAccount | None = None,
    failure_reason: str = "",
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record an audit event when payment execution fails."""
    meta = {
        "invoice_number": payment_request.invoice_number,
        "failure_reason": failure_reason,
        "status": "FAILED",
    }
    if metadata:
        meta.update(metadata)

    return record_audit_event(
        action=AuditAction.PAYMENT_FAILED,
        entity_type="PaymentRequest",
        entity_id=payment_request.id,
        actor=actor,
        description=(
            f"Payment processing failed for invoice "
            f"'{payment_request.invoice_number}'. Reason: {failure_reason}"
        ),
        metadata=meta,
    )


def log_approval_invalidated(
    payment_request: PaymentRequest,
    *,
    actor: UserAccount | None = None,
    reason: str = "",
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record an audit event when prior approvals are invalidated."""
    meta = {
        "invoice_number": payment_request.invoice_number,
        "new_amount": str(payment_request.amount),
    }
    if reason:
        meta["reason"] = reason
    if metadata:
        meta.update(metadata)

    return record_audit_event(
        action=AuditAction.APPROVAL_INVALIDATED,
        entity_type="PaymentRequest",
        entity_id=payment_request.id,
        actor=actor,
        description=(
            f"Approvals invalidated for invoice "
            f"'{payment_request.invoice_number}' due to material changes."
        ),
        metadata=meta,
    )


def log_vendor_created(
    vendor: Vendor,
    *,
    actor: UserAccount | None = None,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record an audit event when a new vendor is registered."""
    meta = {"vendor_name": vendor.name}
    if metadata:
        meta.update(metadata)

    return record_audit_event(
        action=AuditAction.VENDOR_CREATED,
        entity_type="Vendor",
        entity_id=vendor.id,
        actor=actor,
        description=f"Created vendor '{vendor.name}'.",
        metadata=meta,
    )


def log_project_created(
    project: Project,
    *,
    actor: UserAccount | None = None,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record an audit event when a new project/department is registered."""
    meta = {"project_name": project.name, "code": project.code}
    if metadata:
        meta.update(metadata)

    return record_audit_event(
        action=AuditAction.PROJECT_CREATED,
        entity_type="Project",
        entity_id=project.id,
        actor=actor,
        description=f"Created project '{project.name}'.",
        metadata=meta,
    )


def get_entity_audit_trail(
    entity_type: str, entity_id: uuid.UUID
) -> QuerySet[AuditEvent]:
    """Return chronological audit trail for a specific entity."""
    return AuditEvent.objects.filter(
        entity_type=entity_type,
        entity_id=entity_id,
    ).order_by("created_at")


def query_audit_events(
    *,
    action: str | None = None,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
    actor_id: uuid.UUID | None = None,
) -> QuerySet[AuditEvent]:
    """Retrieve filtered audit events for compliance and security auditing."""
    qs = AuditEvent.objects.all().select_related("actor").order_by("-created_at")
    if action:
        qs = qs.filter(action=action)
    if entity_type:
        qs = qs.filter(entity_type=entity_type)
    if entity_id:
        qs = qs.filter(entity_id=entity_id)
    if actor_id:
        qs = qs.filter(actor_id=actor_id)
    return qs
