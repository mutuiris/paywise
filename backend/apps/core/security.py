"""Cross-cutting security and data sanitisation utilities.

Provides centralized protections against leaking sensitive credentials,
session tokens, and financial authentication secrets into logs, audit events,
or persistent storage.
"""

from __future__ import annotations

import uuid
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
        "auth_token",
        "cookie",
        "session",
        "csrf",
        "api_key",
        "private_key",
        "account_number",
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


def sanitise_metadata(metadata: dict[str, Any] | None) -> dict[str, Any]:
    """Sanitise contextual metadata by filtering out sensitive credential keys.

    Inspects metadata key names in a case-insensitive manner against known
    sensitive key patterns (e.g. passwords, authentication tokens, cookies,
    and payment card numbers) to prevent credential leaks into audit trails
    or application logs.

    Args:
        metadata: A dictionary of key-value pairs representing contextual
            information attached to a business event.

    Returns:
        A copy of the metadata dictionary containing only non-sensitive
        entries.
    """
    if not metadata or not isinstance(metadata, dict):
        return {}

    cleaned: dict[str, Any] = {}
    for key, value in metadata.items():
        lower_key = str(key).lower()
        if lower_key in SENSITIVE_KEYS or any(s in lower_key for s in SENSITIVE_KEYS):
            continue
        if isinstance(value, dict):
            cleaned[key] = sanitise_metadata(value)
        elif isinstance(value, list):
            cleaned[key] = [
                sanitise_metadata(item) if isinstance(item, dict) else item
                for item in value
            ]
        elif isinstance(value, uuid.UUID):
            cleaned[key] = str(value)
        else:
            cleaned[key] = value
    return cleaned
