"""Approval domain models and state representations."""

from __future__ import annotations

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.accounts.models import UserRole
from apps.core.models import OwnerAbstract


class ApprovalDecision(models.TextChoices):
    """Enumeration of approval decisions."""

    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class ApprovalTier(models.TextChoices):
    """Enumeration of approval authority tiers."""

    MANAGER = "MANAGER", "Manager Approval"
    FINANCE = "FINANCE", "Finance Approval"


class Approval(OwnerAbstract):
    """Record of an explicit approval or rejection decision by an authorized actor.

    Tracks the target payment request, the approving user, their authority tier,
    the decision made, and any supporting rationale (mandatory on rejection).
    """

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
        """Validate domain invariants for approval decisions.

        Enforces:
        1. Non-empty explanation when rejecting a request.
        2. Prevention of self-approval (creators/requesters cannot approve).
        3. Role-to-tier alignment (Manager for MANAGER, Finance for FINANCE).
        """
        super().clean()
        if self.decision == ApprovalDecision.REJECTED and not self.reason.strip():
            raise ValidationError(
                {"reason": "A reason is mandatory when rejecting a payment request."}
            )

        # Enforce segregation of duties: requester/creator cannot approve
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

        # Validate that approver role corresponds to tier authority
        if self.approver_id and hasattr(self, "approver") and self.approver:
            is_super = getattr(self.approver, "is_superuser", False)
            if not is_super:
                role = getattr(self.approver, "role", None)
                if self.tier == ApprovalTier.MANAGER and role not in (
                    UserRole.MANAGER,
                    UserRole.ADMINISTRATOR,
                ):
                    raise ValidationError(
                        {
                            "approver": (
                                "Only Managers and Administrators can grant "
                                "Manager tier approval."
                            )
                        }
                    )
                if self.tier == ApprovalTier.FINANCE and role not in (
                    UserRole.FINANCE_OFFICER,
                    UserRole.ADMINISTRATOR,
                ):
                    raise ValidationError(
                        {
                            "approver": (
                                "Only Finance Officers and Administrators can grant "
                                "Finance tier approval."
                            )
                        }
                    )

    def __str__(self) -> str:
        """Return readable string representation of approval decision."""
        return (
            f"{self.tier} ({self.decision}) by {self.approver} "
            f"for {self.payment_request.invoice_number}"
        )
