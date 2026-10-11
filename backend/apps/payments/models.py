from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from apps.core.models import OwnerAbstract


class PaymentRequestStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    SUBMITTED = "SUBMITTED", "Submitted"
    PENDING_APPROVAL = "PENDING_APPROVAL", "Pending Approval"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"
    PROCESSING = "PROCESSING", "Processing"
    PAID = "PAID", "Paid"
    FAILED = "FAILED", "Failed"


class PaymentMethod(models.TextChoices):
    MPESA = "MPESA", "M-Pesa"
    BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"
    OTHER = "OTHER", "Other"


class PaymentRequest(OwnerAbstract):
    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.PROTECT,
        related_name="payment_requests",
    )
    project = models.ForeignKey(
        "vendors.Project",
        on_delete=models.PROTECT,
        related_name="payment_requests",
        null=True,
        blank=True,
    )
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="requested_payments",
        null=True,
        blank=True,
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    currency = models.CharField(max_length=3, default="KES")
    invoice_number = models.CharField(max_length=100)
    description = models.TextField()
    payment_method = models.CharField(
        max_length=50,
        choices=PaymentMethod.choices,
        default=PaymentMethod.MPESA,
    )
    status = models.CharField(
        max_length=30,
        choices=PaymentRequestStatus.choices,
        default=PaymentRequestStatus.DRAFT,
        db_index=True,
    )
    rejection_reason = models.TextField(blank=True, default="")
    supporting_notes = models.TextField(blank=True, default="")

    class Meta:
        db_table = "payments_paymentrequest"
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["vendor", "invoice_number"],
                name="unique_vendor_invoice_number",
            ),
            models.CheckConstraint(
                condition=models.Q(amount__gt=0),
                name="payment_request_amount_positive",
            ),
        ]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["vendor", "status"]),
            models.Index(fields=["created_at"]),
        ]

    def clean(self) -> None:
        super().clean()
        if self.amount is not None and self.amount <= Decimal("0.00"):
            raise ValidationError({"amount": "Amount must be greater than zero."})
        if (
            self.status == PaymentRequestStatus.REJECTED
            and not self.rejection_reason.strip()
        ):
            raise ValidationError(
                {
                    "rejection_reason": (
                        "Rejection reason is required when status is REJECTED."
                    )
                }
            )

    def __str__(self) -> str:
        return (
            f"{self.invoice_number} - {self.vendor.name} "
            f"({self.amount} {self.currency})"
        )


class PaymentAttemptStatus(models.TextChoices):
    PROCESSING = "PROCESSING", "Processing"
    SUCCESS = "SUCCESS", "Success"
    FAILED = "FAILED", "Failed"
    AMBIGUOUS = "AMBIGUOUS", "Ambiguous"


class PaymentAttempt(OwnerAbstract):
    payment_request = models.ForeignKey(
        PaymentRequest,
        on_delete=models.PROTECT,
        related_name="payment_attempts",
    )
    idempotency_key = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
    )
    status = models.CharField(
        max_length=30,
        choices=PaymentAttemptStatus.choices,
        default=PaymentAttemptStatus.PROCESSING,
        db_index=True,
    )
    provider_reference = models.CharField(
        max_length=255,
        blank=True,
        default="",
        db_index=True,
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    currency = models.CharField(max_length=3, default="KES")
    payment_method = models.CharField(max_length=50, blank=True, default="")
    failure_reason = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "payments_paymentattempt"
        ordering = ("-created_at",)
        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gt=0),
                name="payment_attempt_amount_positive",
            ),
        ]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["provider_reference"]),
        ]

    def clean(self) -> None:
        super().clean()
        if self.amount is not None and self.amount <= Decimal("0.00"):
            raise ValidationError({"amount": "Amount must be greater than zero."})

    def __str__(self) -> str:
        return f"Attempt {self.idempotency_key} - {self.status}"
