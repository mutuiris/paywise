"""Audit history JSON API views."""

from __future__ import annotations

import uuid
from typing import Any

from django.core.paginator import Paginator
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods

from apps.accounts.models import UserRole
from apps.audit.models import AuditEvent


def _audit_event_to_dict(event: AuditEvent) -> dict[str, Any]:
    """Serialise an AuditEvent model instance to a JSON-compatible dictionary."""
    return {
        "id": str(event.id),
        "actor": {
            "id": str(event.actor_id) if event.actor_id else None,
            "email": event.actor_email,
        }
        if event.actor_id or event.actor_email
        else None,
        "action": event.action,
        "entity_type": event.entity_type,
        "entity_id": str(event.entity_id),
        "description": event.description,
        "metadata": event.metadata,
        "created_at": event.created_at.isoformat() if event.created_at else None,
    }


@require_http_methods(["GET"])
def audit_event_list_view(request: HttpRequest) -> JsonResponse:
    """List paginated audit events with optional filtering.

    Permissions:
        Administrators and Finance Officers can view audit history.
    Status Codes:
        200 OK, 401 Unauthorized, 403 Forbidden, 400 Bad Request.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if not request.user.is_active:
        return JsonResponse({"error": "Account is inactive."}, status=401)

    role = getattr(request.user, "role", None)
    if not getattr(request.user, "is_superuser", False) and role not in (
        UserRole.ADMINISTRATOR,
        UserRole.FINANCE_OFFICER,
    ):
        return JsonResponse({"error": "Permission denied."}, status=403)

    queryset = AuditEvent.objects.all().order_by("-created_at")

    entity_type = request.GET.get("entity_type", "").strip()
    if entity_type:
        queryset = queryset.filter(entity_type=entity_type)

    entity_id_str = request.GET.get("entity_id", "").strip()
    if entity_id_str:
        try:
            entity_id = uuid.UUID(entity_id_str)
            queryset = queryset.filter(entity_id=entity_id)
        except ValueError:
            return JsonResponse({"error": "Invalid entity_id UUID format."}, status=400)

    action = request.GET.get("action", "").strip()
    if action:
        queryset = queryset.filter(action=action)

    try:
        page_size = min(max(int(request.GET.get("page_size", 20)), 1), 100)
        page_number = max(int(request.GET.get("page", 1)), 1)
    except ValueError:
        return JsonResponse(
            {"error": "Invalid page or page_size parameters."}, status=400
        )

    paginator = Paginator(queryset, page_size)
    page_obj = paginator.get_page(page_number)

    return JsonResponse(
        {
            "count": paginator.count,
            "num_pages": paginator.num_pages,
            "page": page_obj.number,
            "results": [_audit_event_to_dict(e) for e in page_obj],
        },
        status=200,
    )
