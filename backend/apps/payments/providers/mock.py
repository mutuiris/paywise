"""Deterministic mock payment provider for local and automated testing."""

from __future__ import annotations

import hashlib
import uuid
from decimal import Decimal
from typing import Any

from apps.payments.models import PaymentAttemptStatus
from apps.payments.providers.base import PaymentProvider, ProviderPaymentResult


class MockPaymentProvider(PaymentProvider):
    """Deterministic mock provider that simulates payment gateway responses.

    Supports configurable test modes (SUCCESS, FAILED, AMBIGUOUS) as well as
    deterministic outcome routing based on transaction amount decimals:
      - Amounts ending in .99 trigger a simulated payment failure.
      - Amounts ending in .88 trigger a simulated gateway timeout / ambiguous state.
      - All other amounts succeed deterministically.
    """

    def __init__(
        self,
        *,
        mode: str | None = None,
        reconciliation_mode: str | None = None,
    ) -> None:
        """Initialize mock provider with optional override modes."""
        self.mode = mode
        self.reconciliation_mode = reconciliation_mode

    def _generate_reference(self, idempotency_key: str) -> str:
        """Generate a deterministic provider reference based on idempotency key."""
        digest = (
            hashlib.sha256(idempotency_key.encode("utf-8")).hexdigest()[:12].upper()
        )
        return f"MPESA-MOCK-{digest}"

    def process_payment(
        self,
        *,
        payment_request_id: uuid.UUID,
        amount: Decimal,
        currency: str,
        payment_method: str,
        destination_details: dict[str, Any],
        idempotency_key: str,
    ) -> ProviderPaymentResult:
        """Execute a simulated payment transaction with deterministic results."""
        reference = self._generate_reference(idempotency_key)

        if self.mode == "FORCE_FAILED":
            return ProviderPaymentResult(
                status=PaymentAttemptStatus.FAILED,
                provider_reference=reference,
                failure_reason="Forced failure: Simulated provider rejection.",
                metadata={"channel": payment_method, "currency": currency},
            )

        if self.mode == "FORCE_AMBIGUOUS":
            return ProviderPaymentResult(
                status=PaymentAttemptStatus.AMBIGUOUS,
                provider_reference=reference,
                failure_reason="Forced ambiguity: Connection timeout.",
                metadata={"channel": payment_method, "currency": currency},
            )

        if self.mode == "FORCE_SUCCESS":
            return ProviderPaymentResult(
                status=PaymentAttemptStatus.SUCCESS,
                provider_reference=reference,
                metadata={
                    "channel": payment_method,
                    "currency": currency,
                    "receipt": f"RC-{reference}",
                },
            )

        # Automatic outcome routing based on amount cents
        cents = str(amount).split(".")[-1] if "." in str(amount) else "00"
        if cents == "99":
            return ProviderPaymentResult(
                status=PaymentAttemptStatus.FAILED,
                provider_reference=reference,
                failure_reason=(
                    "Simulated gateway error: Recipient account limit reached."
                ),
                metadata={"channel": payment_method, "currency": currency},
            )

        if cents == "88":
            return ProviderPaymentResult(
                status=PaymentAttemptStatus.AMBIGUOUS,
                provider_reference=reference,
                failure_reason=(
                    "Simulated gateway timeout: No immediate confirmation received."
                ),
                metadata={"channel": payment_method, "currency": currency},
            )

        return ProviderPaymentResult(
            status=PaymentAttemptStatus.SUCCESS,
            provider_reference=reference,
            metadata={
                "channel": payment_method,
                "currency": currency,
                "receipt": f"RC-{reference}",
            },
        )

    def query_payment_status(
        self,
        *,
        provider_reference: str,
        idempotency_key: str,
    ) -> ProviderPaymentResult:
        """Query the status of an existing transaction for reconciliation."""
        if self.reconciliation_mode == "FORCE_FAILED":
            return ProviderPaymentResult(
                status=PaymentAttemptStatus.FAILED,
                provider_reference=provider_reference,
                failure_reason="Reconciliation confirmed payment failure.",
            )

        if self.reconciliation_mode == "FORCE_AMBIGUOUS":
            return ProviderPaymentResult(
                status=PaymentAttemptStatus.AMBIGUOUS,
                provider_reference=provider_reference,
                failure_reason="Transaction still pending upstream verification.",
            )

        return ProviderPaymentResult(
            status=PaymentAttemptStatus.SUCCESS,
            provider_reference=provider_reference,
            metadata={"reconciled": True, "receipt": f"RC-{provider_reference}"},
        )
