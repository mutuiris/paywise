from __future__ import annotations

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import OwnerAbstract


class ApprovalDecision(models.TextChoices):
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class ApprovalTier(models.TextChoices):
    MANAGER = "MANAGER", "Manager Approval"
    FINANCE = "FINANCE", "Finance Approval"


class Approval(OwnerAbstract):
    payment_request = models.ForeignKey(
        "payments.PaymentRequest",
        on_delete=models.PROTECT,
        related_name="approvals",
    )
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="approvals",
    )
    tier = models.CharField(
        max_length=30,
        choices=ApprovalTier.choices,
    )
    decision = models.CharField(
        max_length=30,
        choices=ApprovalDecision.choices,
    )
    reason = models.TextField(blank=True, default="")

    class Meta:
        db_table = "approvals_approval"
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["payment_request", "approver", "tier"],
                name="unique_payment_request_approver_tier",
            ),
        ]
        indexes = [
            models.Index(fields=["payment_request", "tier"]),
            models.Index(fields=["approver"]),
        ]

    def clean(self) -> None:
        super().clean()
        if self.decision == ApprovalDecision.REJECTED and not self.reason.strip():
            raise ValidationError(
                {"reason": "A reason is mandatory when rejecting a payment request."}
            )
        if self.payment_request_id and self.approver_id:
            is_requester = (
                getattr(self.payment_request, "requester_id", None) == self.approver_id
            )
            is_creator = (
                getattr(self.payment_request, "created_by", None) == self.approver_id
            )
            if is_requester or is_creator:
                raise ValidationError(
                    {
                        "approver": (
                            "Requesters cannot approve their own payment requests."
                        )
                    }
                )

    def __str__(self) -> str:
        return (
            f"{self.tier} ({self.decision}) by {self.approver} "
            f"for {self.payment_request.invoice_number}"
        )
