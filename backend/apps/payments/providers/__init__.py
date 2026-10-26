"""Payment provider package and factory functions."""

from __future__ import annotations

import importlib
from typing import Any

from django.conf import settings

from apps.payments.providers.base import (
    PaymentProvider,
    PaymentProviderError,
    ProviderPaymentResult,
)
from apps.payments.providers.mock import MockPaymentProvider

__all__ = [
    "PaymentProvider",
    "PaymentProviderError",
    "ProviderPaymentResult",
    "MockPaymentProvider",
    "get_payment_provider",
]


def get_payment_provider(**kwargs: Any) -> PaymentProvider:
    """Instantiate and return the configured payment provider backend."""
    backend_path = getattr(
        settings,
        "PAYMENT_PROVIDER_BACKEND",
        "apps.payments.providers.mock.MockPaymentProvider",
    )
    module_name, class_name = backend_path.rsplit(".", 1)
    module = importlib.import_module(module_name)
    provider_class = getattr(module, class_name)
    return provider_class(**kwargs)
