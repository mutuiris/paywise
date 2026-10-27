"""HTTP JSON API views for approval queue, decisions, and amount updates."""

from __future__ import annotations

import json
import uuid
from decimal import Decimal, InvalidOperation
from typing import Any

from django.core.exceptions import PermissionDenied, ValidationError
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods

from apps.approvals import services
from apps.approvals.models import Approval, ApprovalDecision
from apps.approvals.permissions import is_active_authenticated_user
from apps.payments.models import PaymentRequest
from apps.payments.permissions import can_view_payment_request


def _parse_json_body(request: HttpRequest) -> dict[str, Any]:
    """Parse JSON payload safely from request body."""
    if not request.body:
        return {}
    try:
        data = json.loads(request.body.decode("utf-8"))
        if not isinstance(data, dict):
            raise ValidationError("JSON body must be an object.")
        return data
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValidationError(f"Invalid JSON payload: {exc}") from exc


def approval_to_dict(approval: Approval) -> dict[str, Any]:
    """Serialize an Approval model instance into a dictionary."""
    return {
        "id": str(approval.id),
        "payment_request_id": str(approval.payment_request_id),
        "approver_id": str(approval.approver_id),
        "approver_name": getattr(approval.approver, "get_full_name", lambda: "")()
        or approval.approver.username,
        "tier": approval.tier,
        "decision": approval.decision,
        "reason": approval.reason,
        "is_active": approval.is_active,
        "created_at": approval.created_at.isoformat() if approval.created_at else None,
    }


def payment_request_summary(payment_request: PaymentRequest) -> dict[str, Any]:
    """Serialize a PaymentRequest instance with approval metadata."""
    return {
        "id": str(payment_request.id),
        "invoice_number": payment_request.invoice_number,
        "amount": str(payment_request.amount),
        "currency": payment_request.currency,
        "status": payment_request.status,
        "description": payment_request.description,
        "vendor_id": str(payment_request.vendor_id),
        "vendor_name": payment_request.vendor.name if payment_request.vendor else None,
        "project_name": (
            payment_request.project.name if payment_request.project else None
        ),
        "payment_method": payment_request.payment_method,
        "requester_id": (
            str(payment_request.requester_id) if payment_request.requester_id else None
        ),
        "requester_name": (
            payment_request.requester.username if payment_request.requester else None
        ),
        "required_tiers": services.get_required_tiers(payment_request),
        "approved_tiers": services.get_approved_tiers(payment_request),
        "pending_tiers": services.get_pending_tiers(payment_request),
        "is_fully_approved": services.is_fully_approved(payment_request),
        "created_at": (
            payment_request.created_at.isoformat()
            if payment_request.created_at
            else None
        ),
    }


@require_http_methods(["GET"])
def approval_queue_view(request: HttpRequest) -> JsonResponse:
    """Retrieve list of payment requests awaiting approval by the authenticated user."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."}, status=401
        )

    tier_param = request.GET.get("tier")
    queue_qs = services.get_approval_queue(request.user, tier=tier_param)

    results = [payment_request_summary(req) for req in queue_qs]
    return JsonResponse({"results": results, "count": len(results)}, status=200)


@require_http_methods(["GET"])
def payment_approval_detail_view(
    request: HttpRequest, payment_request_id: uuid.UUID
) -> JsonResponse:
    """Retrieve approval status and decision history for a specific payment request."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."}, status=401
        )

    try:
        payment_request = PaymentRequest.objects.select_related(
            "vendor", "project", "requester"
        ).get(id=payment_request_id)
    except PaymentRequest.DoesNotExist, ValueError:
        return JsonResponse({"detail": "Payment request not found."}, status=404)

    if not can_view_payment_request(request.user, payment_request):
        return JsonResponse(
            {"detail": "You do not have permission to view this payment request."},
            status=403,
        )

    data = payment_request_summary(payment_request)
    data["history"] = services.get_approval_history(payment_request)
    data["rejection_reason"] = payment_request.rejection_reason
    return JsonResponse(data, status=200)


@require_http_methods(["POST"])
def record_approval_decision_view(
    request: HttpRequest, payment_request_id: uuid.UUID
) -> JsonResponse:
    """Record an approval or rejection decision for a payment request."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."}, status=401
        )

    try:
        payload = _parse_json_body(request)
    except ValidationError as err:
        return JsonResponse({"detail": err.message}, status=400)

    decision = payload.get("decision", ApprovalDecision.APPROVED)
    tier = payload.get("tier")
    reason = payload.get("reason", "")

    try:
        payment_request = PaymentRequest.objects.get(id=payment_request_id)
    except PaymentRequest.DoesNotExist, ValueError:
        return JsonResponse({"detail": "Payment request not found."}, status=404)

    try:
        approval = services.record_approval(
            payment_request=payment_request,
            approver=request.user,
            tier=tier,
            decision=decision,
            reason=reason,
        )
    except PermissionDenied as err:
        return JsonResponse({"detail": str(err)}, status=403)
    except ValidationError as err:
        message = err.message_dict if hasattr(err, "message_dict") else err.messages
        return JsonResponse({"detail": message}, status=400)

    payment_request.refresh_from_db()
    return JsonResponse(
        {
            "approval": approval_to_dict(approval),
            "payment_request_status": payment_request.status,
            "is_fully_approved": services.is_fully_approved(payment_request),
        },
        status=201,
    )


@require_http_methods(["POST"])
def approve_payment_request_view(
    request: HttpRequest, payment_request_id: uuid.UUID
) -> JsonResponse:
    """Dedicated endpoint to approve a payment request."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."}, status=401
        )

    try:
        payload = _parse_json_body(request)
    except ValidationError as err:
        return JsonResponse({"detail": err.message}, status=400)

    tier = payload.get("tier")
    reason = payload.get("reason", "")

    try:
        payment_request = PaymentRequest.objects.get(id=payment_request_id)
    except PaymentRequest.DoesNotExist, ValueError:
        return JsonResponse({"detail": "Payment request not found."}, status=404)

    try:
        approval = services.record_approval(
            payment_request=payment_request,
            approver=request.user,
            tier=tier,
            decision=ApprovalDecision.APPROVED,
            reason=reason,
        )
    except PermissionDenied as err:
        return JsonResponse({"detail": str(err)}, status=403)
    except ValidationError as err:
        message = err.message_dict if hasattr(err, "message_dict") else err.messages
        return JsonResponse({"detail": message}, status=400)

    payment_request.refresh_from_db()
    return JsonResponse(
        {
            "approval": approval_to_dict(approval),
            "payment_request_status": payment_request.status,
            "is_fully_approved": services.is_fully_approved(payment_request),
        },
        status=201,
    )


@require_http_methods(["POST"])
def reject_payment_request_view(
    request: HttpRequest, payment_request_id: uuid.UUID
) -> JsonResponse:
    """Dedicated endpoint to reject a payment request with a mandatory reason."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."}, status=401
        )

    try:
        payload = _parse_json_body(request)
    except ValidationError as err:
        return JsonResponse({"detail": err.message}, status=400)

    reason = payload.get("reason", "")
    tier = payload.get("tier")

    try:
        payment_request = PaymentRequest.objects.get(id=payment_request_id)
    except PaymentRequest.DoesNotExist, ValueError:
        return JsonResponse({"detail": "Payment request not found."}, status=404)

    try:
        approval = services.record_approval(
            payment_request=payment_request,
            approver=request.user,
            tier=tier,
            decision=ApprovalDecision.REJECTED,
            reason=reason,
        )
    except PermissionDenied as err:
        return JsonResponse({"detail": str(err)}, status=403)
    except ValidationError as err:
        message = err.message_dict if hasattr(err, "message_dict") else err.messages
        return JsonResponse({"detail": message}, status=400)

    payment_request.refresh_from_db()
    return JsonResponse(
        {
            "approval": approval_to_dict(approval),
            "payment_request_status": payment_request.status,
            "rejection_reason": payment_request.rejection_reason,
        },
        status=201,
    )


@require_http_methods(["POST"])
def update_payment_request_amount_view(
    request: HttpRequest, payment_request_id: uuid.UUID
) -> JsonResponse:
    """Update payment request amount, re-evaluating and invalidating prior approvals."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."}, status=401
        )

    try:
        payload = _parse_json_body(request)
    except ValidationError as err:
        return JsonResponse({"detail": err.message}, status=400)

    amount_val = payload.get("amount")
    if amount_val is None:
        return JsonResponse({"detail": "Amount field is required."}, status=400)

    try:
        new_amount = Decimal(str(amount_val))
    except InvalidOperation, ValueError:
        return JsonResponse({"detail": "Invalid decimal amount."}, status=400)

    try:
        payment_request = PaymentRequest.objects.get(id=payment_request_id)
    except PaymentRequest.DoesNotExist, ValueError:
        return JsonResponse({"detail": "Payment request not found."}, status=404)

    try:
        updated_req = services.update_payment_request_amount(
            payment_request=payment_request,
            new_amount=new_amount,
            actor=request.user,
        )
    except ValidationError as err:
        message = err.message_dict if hasattr(err, "message_dict") else err.messages
        return JsonResponse({"detail": message}, status=400)

    return JsonResponse(
        {
            "id": str(updated_req.id),
            "amount": str(updated_req.amount),
            "status": updated_req.status,
            "is_fully_approved": services.is_fully_approved(updated_req),
            "pending_tiers": services.get_pending_tiers(updated_req),
        },
        status=200,
    )
