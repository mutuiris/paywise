"""Cross-cutting security and data sanitisation utilities.

Provides centralized protections against leaking sensitive credentials,
session tokens, and financial authentication secrets into logs, audit events,
or persistent storage.
"""

from __future__ import annotations

from typing import Any

from django.core.exceptions import PermissionDenied
from django.http import HttpRequest

from apps.accounts.models import UserAccount

SENSITIVE_KEYS: frozenset[str] = frozenset(
    {
        "password",
        "secret",
        "token",
        "authorization",
        "cookie",
        "session",
        "csrf",
        "api_key",
        "private_key",
        "credit_card",
        "card_number",
        "cvv",
        "pin",
    }
)


def authenticated_user(request: HttpRequest) -> UserAccount:
    """Return the custom user model after an authenticated view check."""
    if not isinstance(request.user, UserAccount):
        raise PermissionDenied("A UserAccount session is required.")
    return request.user


def sanitise_metadata(metadata: dict[str, Any]) -> dict[str, Any]:
    """Sanitise contextual metadata by filtering out sensitive credential keys.

    Inspects metadata key names in a case-insensitive manner against known
    sensitive key patterns (e.g. passwords, authentication tokens, cookies,
    and payment card numbers) to prevent credential leaks into audit trails
    or application logs.

    Args:
        metadata: A dictionary of key-value pairs representing contextual
            information attached to a business event.

    Returns:
        A shallow copy of the metadata dictionary containing only non-sensitive
        entries.
    """
    if not isinstance(metadata, dict):
        return {}

    return {
        key: value
        for key, value in metadata.items()
        if key.lower() not in SENSITIVE_KEYS
    }
