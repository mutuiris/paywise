from __future__ import annotations

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import OwnerlessAbstract


class AuditAction(models.TextChoices):
    PAYMENT_REQUEST_CREATED = "PAYMENT_REQUEST_CREATED", "Payment Request Created"
    PAYMENT_REQUEST_SUBMITTED = "PAYMENT_REQUEST_SUBMITTED", "Payment Request Submitted"
    PAYMENT_REQUEST_APPROVED = "PAYMENT_REQUEST_APPROVED", "Payment Request Approved"
    PAYMENT_REQUEST_REJECTED = "PAYMENT_REQUEST_REJECTED", "Payment Request Rejected"
    PAYMENT_PROCESSING_STARTED = (
        "PAYMENT_PROCESSING_STARTED",
        "Payment Processing Started",
    )
    PAYMENT_COMPLETED = "PAYMENT_COMPLETED", "Payment Completed"
    PAYMENT_FAILED = "PAYMENT_FAILED", "Payment Failed"
    APPROVAL_INVALIDATED = "APPROVAL_INVALIDATED", "Approval Invalidated"
    VENDOR_CREATED = "VENDOR_CREATED", "Vendor Created"
    PROJECT_CREATED = "PROJECT_CREATED", "Project Created"
    USER_ROLE_CHANGED = "USER_ROLE_CHANGED", "User Role Changed"


class AuditEvent(OwnerlessAbstract):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_events",
    )
    actor_email = models.CharField(max_length=255, blank=True, default="")
    action = models.CharField(max_length=100, db_index=True)
    entity_type = models.CharField(max_length=100, db_index=True)
    entity_id = models.UUIDField(db_index=True)
    description = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "audit_auditevent"
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["entity_type", "entity_id"]),
            models.Index(fields=["action", "created_at"]),
        ]

    def save(self, *args, **kwargs) -> None:
        if not self._state.adding and AuditEvent.objects.filter(pk=self.pk).exists():
            raise ValidationError(
                "AuditEvent records are immutable and cannot be updated."
            )
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs) -> None:
        raise ValidationError("AuditEvent records are immutable and cannot be deleted.")

    def __str__(self) -> str:
        return f"{self.action} on {self.entity_type} ({self.entity_id})"
