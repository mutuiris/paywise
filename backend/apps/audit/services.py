"""Audit service for creating immutable business event records.

Provides a consistent interface for recording audit events atomically
with the business state changes they describe. All workflow services
should use this module rather than creating AuditEvent records directly.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from apps.audit.models import AuditAction, AuditEvent
from apps.core.security import sanitise_metadata

if TYPE_CHECKING:
    from uuid import UUID

    from apps.accounts.models import UserAccount


def record_event(
    *,
    actor: UserAccount | None,
    action: str,
    entity_type: str,
    entity_id: UUID,
    description: str = "",
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Create an immutable audit event record.

    This function should be called inside the same transaction.atomic()
    block as the business state change it describes, ensuring both
    succeed or fail together.

    Args:
        actor: The authenticated user performing the action. May be None
            for system-initiated events.
        action: The action identifier (use AuditAction choices where
            applicable).
        entity_type: The type of entity being acted upon (e.g.
            'PaymentRequest', 'Vendor').
        entity_id: The UUID of the entity being acted upon.
        description: A human-readable description of the event.
        metadata: Safe, non-sensitive contextual data to store with
            the event. Must not contain credentials, tokens, or
            raw payment details.

    Returns:
        The created AuditEvent instance.
    """
    safe_metadata = sanitise_metadata(metadata or {})

    event = AuditEvent(
        actor=actor,
        actor_email=getattr(actor, "email", "") or "",
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
        metadata=safe_metadata,
    )
    event.save()
    return event


def record_payment_request_created(
    *,
    actor: UserAccount,
    payment_request_id: UUID,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record a payment request creation event."""
    return record_event(
        actor=actor,
        action=AuditAction.PAYMENT_REQUEST_CREATED,
        entity_type="PaymentRequest",
        entity_id=payment_request_id,
        description="Payment request created.",
        metadata=metadata,
    )


def record_payment_request_submitted(
    *,
    actor: UserAccount,
    payment_request_id: UUID,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record a payment request submission event."""
    return record_event(
        actor=actor,
        action=AuditAction.PAYMENT_REQUEST_SUBMITTED,
        entity_type="PaymentRequest",
        entity_id=payment_request_id,
        description="Payment request submitted for approval.",
        metadata=metadata,
    )


def record_payment_request_approved(
    *,
    actor: UserAccount,
    payment_request_id: UUID,
    tier: str,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record a payment request approval event."""
    return record_event(
        actor=actor,
        action=AuditAction.PAYMENT_REQUEST_APPROVED,
        entity_type="PaymentRequest",
        entity_id=payment_request_id,
        description=f"Payment request approved at {tier} tier.",
        metadata=metadata,
    )


def record_payment_request_rejected(
    *,
    actor: UserAccount,
    payment_request_id: UUID,
    tier: str,
    reason: str,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record a payment request rejection event."""
    return record_event(
        actor=actor,
        action=AuditAction.PAYMENT_REQUEST_REJECTED,
        entity_type="PaymentRequest",
        entity_id=payment_request_id,
        description=f"Payment request rejected at {tier} tier: {reason}",
        metadata=metadata,
    )


def record_payment_processing_started(
    *,
    actor: UserAccount,
    payment_request_id: UUID,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record that payment processing has started."""
    return record_event(
        actor=actor,
        action=AuditAction.PAYMENT_PROCESSING_STARTED,
        entity_type="PaymentRequest",
        entity_id=payment_request_id,
        description="Payment processing started.",
        metadata=metadata,
    )


def record_payment_completed(
    *,
    actor: UserAccount | None,
    payment_request_id: UUID,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record a successful payment completion event."""
    return record_event(
        actor=actor,
        action=AuditAction.PAYMENT_COMPLETED,
        entity_type="PaymentRequest",
        entity_id=payment_request_id,
        description="Payment completed successfully.",
        metadata=metadata,
    )


def record_payment_failed(
    *,
    actor: UserAccount | None,
    payment_request_id: UUID,
    reason: str = "",
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record a payment failure event."""
    return record_event(
        actor=actor,
        action=AuditAction.PAYMENT_FAILED,
        entity_type="PaymentRequest",
        entity_id=payment_request_id,
        description=f"Payment failed: {reason}" if reason else "Payment failed.",
        metadata=metadata,
    )


def record_approval_invalidated(
    *,
    actor: UserAccount,
    payment_request_id: UUID,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record that approvals have been invalidated (e.g. due to amount change)."""
    return record_event(
        actor=actor,
        action=AuditAction.APPROVAL_INVALIDATED,
        entity_type="PaymentRequest",
        entity_id=payment_request_id,
        description="Existing approvals invalidated due to material change.",
        metadata=metadata,
    )


def record_vendor_created(
    *,
    actor: UserAccount,
    vendor_id: UUID,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record a vendor creation event."""
    return record_event(
        actor=actor,
        action=AuditAction.VENDOR_CREATED,
        entity_type="Vendor",
        entity_id=vendor_id,
        description="Vendor created.",
        metadata=metadata,
    )


def record_project_created(
    *,
    actor: UserAccount,
    project_id: UUID,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    """Record a project creation event."""
    return record_event(
        actor=actor,
        action=AuditAction.PROJECT_CREATED,
        entity_type="Project",
        entity_id=project_id,
        description="Project created.",
        metadata=metadata,
    )
