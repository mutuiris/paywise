"""HTTP JSON API views for payment approval decisions."""

from __future__ import annotations

import json
import uuid
from typing import Any

from django.core.exceptions import PermissionDenied, ValidationError
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods

from apps.approvals import services
from apps.approvals.models import Approval
from apps.core.security import authenticated_user
from apps.payments.models import PaymentRequest


def approval_to_dict(approval: Approval) -> dict[str, Any]:
    """Serialize an Approval model instance into a JSON dictionary."""
    return {
        "id": str(approval.id),
        "payment_request_id": str(approval.payment_request_id),
        "approver": {
            "id": str(approval.approver_id),
            "username": approval.approver.username if approval.approver else None,
        },
        "tier": approval.tier,
        "decision": approval.decision,
        "reason": approval.reason,
        "is_active": approval.is_active,
        "created_at": approval.created_at.isoformat() if approval.created_at else None,
    }


def _parse_json_body(request: HttpRequest) -> dict[str, Any]:
    """Parse and validate JSON payload from HTTP request body."""
    if not request.body:
        return {}
    try:
        data = json.loads(request.body.decode("utf-8"))
        if not isinstance(data, dict):
            raise ValidationError("JSON body must be an object.")
        return data
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValidationError(f"Invalid JSON payload: {exc}") from exc


@require_http_methods(["GET", "POST"])
def approval_decisions_view(
    request: HttpRequest, payment_request_id: uuid.UUID
) -> JsonResponse:
    """List approvals (GET) or record an approval/rejection decision (POST).

    Methods:
        GET: Returns all active approvals for the payment request.
            Status Codes: 200 OK, 401 Unauthorized, 404 Not Found.
        POST: Records a tier approval or rejection.
            Payload:
                tier (str, required): 'MANAGER' or 'FINANCE'.
                decision (str, required): 'APPROVED' or 'REJECTED'.
                reason (str, optional): Required if decision is 'REJECTED'.
            Status Codes: 200 OK, 400 Bad Request, 401 Unauthorized,
            403 Forbidden, 404 Not Found.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if not request.user.is_active:
        return JsonResponse({"error": "Account is inactive."}, status=401)

    payment_request = PaymentRequest.objects.filter(id=payment_request_id).first()
    if payment_request is None:
        return JsonResponse({"error": "Payment request not found."}, status=404)

    if request.method == "GET":
        approvals = Approval.objects.filter(payment_request=payment_request).order_by(
            "created_at"
        )
        return JsonResponse(
            {"approvals": [approval_to_dict(a) for a in approvals]},
            status=200,
        )

    try:
        payload = _parse_json_body(request)
        tier = payload.get("tier", "").strip()
        decision = payload.get("decision", "").strip()
        reason = payload.get("reason", "").strip()

        if not tier or not decision:
            return JsonResponse(
                {"error": "Both 'tier' and 'decision' are required fields."},
                status=400,
            )

        approval, updated_request = services.record_approval_decision(
            payment_request_id=payment_request.id,
            approver=authenticated_user(request),
            tier=tier,
            decision=decision,
            reason=reason,
        )

        return JsonResponse(
            {
                "approval": approval_to_dict(approval),
                "payment_request_status": updated_request.status,
            },
            status=200,
        )
    except ValidationError as exc:
        message = (
            exc.message_dict
            if hasattr(exc, "message_dict")
            else exc.messages
            if hasattr(exc, "messages")
            else str(exc)
        )
        return JsonResponse({"error": message}, status=400)
    except PermissionDenied as exc:
        return JsonResponse({"error": str(exc)}, status=403)
