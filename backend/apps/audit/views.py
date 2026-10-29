"""HTTP JSON API views for the audit trail domain."""

from __future__ import annotations

import uuid
from typing import Any

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods

from apps.audit import services
from apps.audit.models import AuditEvent
from apps.audit.permissions import (
    can_view_audit_events,
    is_active_authenticated_user,
)


def audit_event_to_dict(event: AuditEvent) -> dict[str, Any]:
    """Serialize an AuditEvent model instance into a JSON-compatible dict."""
    return {
        "id": str(event.id),
        "action": event.action,
        "entity_type": event.entity_type,
        "entity_id": str(event.entity_id),
        "actor_id": str(event.actor_id) if event.actor_id else None,
        "actor_email": event.actor_email,
        "description": event.description,
        "metadata": event.metadata,
        "created_at": event.created_at.isoformat() if event.created_at else None,
    }


@require_http_methods(["GET"])
def audit_event_list_view(request: HttpRequest) -> JsonResponse:
    """List system audit events with optional filtering for authorized actors."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."}, status=401
        )
    if not can_view_audit_events(request.user):
        return JsonResponse(
            {
                "detail": (
                    "Only Managers, Finance Officers, and Administrators can "
                    "view audit logs."
                )
            },
            status=403,
        )

    action = request.GET.get("action")
    entity_type = request.GET.get("entity_type")
    entity_id_str = request.GET.get("entity_id")
    actor_id_str = request.GET.get("actor_id")

    entity_id = None
    if entity_id_str:
        try:
            entity_id = uuid.UUID(entity_id_str)
        except ValueError:
            return JsonResponse(
                {"detail": "Invalid entity_id UUID format."}, status=400
            )

    actor_id = None
    if actor_id_str:
        try:
            actor_id = uuid.UUID(actor_id_str)
        except ValueError:
            return JsonResponse({"detail": "Invalid actor_id UUID format."}, status=400)

    qs = services.query_audit_events(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
    )

    results = [audit_event_to_dict(e) for e in qs[:200]]
    return JsonResponse({"results": results, "count": len(results)}, status=200)


@require_http_methods(["GET"])
def entity_audit_trail_view(
    request: HttpRequest, entity_type: str, entity_id: uuid.UUID
) -> JsonResponse:
    """Retrieve the chronological audit trail for a specific business entity."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."}, status=401
        )
    if not can_view_audit_events(request.user):
        return JsonResponse(
            {
                "detail": (
                    "Only Managers, Finance Officers, and Administrators can "
                    "view audit logs."
                )
            },
            status=403,
        )

    trail = services.get_entity_audit_trail(entity_type, entity_id)
    results = [audit_event_to_dict(e) for e in trail]
    return JsonResponse(
        {
            "entity_type": entity_type,
            "entity_id": str(entity_id),
            "events": results,
            "count": len(results),
        },
        status=200,
    )
