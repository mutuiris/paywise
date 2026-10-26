"""Abstract base provider contract for payment execution and status queries."""

from __future__ import annotations

import abc
import uuid
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any

from apps.payments.models import PaymentAttemptStatus


class PaymentProviderError(Exception):
    """Base error for provider failures that leave the outcome uncertain."""


@dataclass(frozen=True)
class ProviderPaymentResult:
    """Standardized result returned by payment provider implementations.

    Attributes:
        status: The outcome status (SUCCESS, FAILED, or AMBIGUOUS).
        provider_reference: External reference identifier from the provider.
        failure_reason: Error message or reason code if the payment failed.
        metadata: Provider-specific transaction receipt or details.
    """

    status: PaymentAttemptStatus
    provider_reference: str
    failure_reason: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)


class PaymentProvider(abc.ABC):
    """Abstract interface defining the payment gateway contract."""

    @abc.abstractmethod
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
        """Submit a payment transaction to the provider gateway."""

    @abc.abstractmethod
    def query_payment_status(
        self,
        *,
        provider_reference: str,
        idempotency_key: str,
    ) -> ProviderPaymentResult:
        """Query the authoritative status of a prior payment attempt."""
