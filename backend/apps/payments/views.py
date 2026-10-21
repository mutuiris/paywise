"""HTTP JSON API views for payment requests, lifecycle, processing, and search."""

from __future__ import annotations

import json
import uuid
from decimal import Decimal, InvalidOperation
from typing import Any

from django.core.exceptions import PermissionDenied, ValidationError
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.core.security import authenticated_user
from apps.payments import services
from apps.payments.models import (
    PaymentAttempt,
    PaymentMethod,
    PaymentRequest,
)
from apps.payments.permissions import (
    can_view_payment_request,
    is_active_authenticated_user,
)


def payment_request_to_dict(req: PaymentRequest) -> dict[str, Any]:
    """Serialize a PaymentRequest model instance into a JSON-compatible dict."""
    return {
        "id": str(req.id),
        "vendor_id": str(req.vendor_id),
        "vendor_name": req.vendor.name if req.vendor else None,
        "vendor": {
            "id": str(req.vendor_id),
            "name": req.vendor.name if req.vendor else None,
        },
        "project_id": str(req.project_id) if req.project_id else None,
        "project_name": req.project.name if req.project else None,
        "project": {
            "id": str(req.project_id),
            "name": req.project.name,
            "code": req.project.code,
        }
        if req.project_id and req.project
        else None,
        "requester_id": str(req.requester_id) if req.requester_id else None,
        "requester_username": req.requester.username if req.requester else None,
        "requester": {
            "id": str(req.requester_id),
            "username": req.requester.username if req.requester else None,
        }
        if req.requester_id
        else None,
        "amount": str(req.amount),
        "currency": req.currency,
        "invoice_number": req.invoice_number,
        "description": req.description,
        "payment_method": req.payment_method,
        "status": req.status,
        "rejection_reason": req.rejection_reason,
        "supporting_notes": req.supporting_notes,
        "is_active": req.is_active,
        "created_at": req.created_at.isoformat() if req.created_at else None,
        "updated_at": req.updated_at.isoformat() if req.updated_at else None,
        "created_by": str(req.created_by) if req.created_by else None,
        "updated_by": str(req.updated_by) if req.updated_by else None,
    }


def payment_attempt_to_dict(attempt: PaymentAttempt) -> dict[str, Any]:
    """Serialize a PaymentAttempt model instance into a JSON-compatible dictionary."""
    return {
        "id": str(attempt.id),
        "payment_request_id": str(attempt.payment_request_id),
        "idempotency_key": attempt.idempotency_key,
        "status": attempt.status,
        "provider_reference": attempt.provider_reference,
        "amount": str(attempt.amount),
        "currency": attempt.currency,
        "payment_method": attempt.payment_method,
        "failure_reason": attempt.failure_reason,
        "metadata": attempt.metadata,
        "created_at": attempt.created_at.isoformat() if attempt.created_at else None,
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


@csrf_exempt
@require_http_methods(["GET", "POST"])
def payment_request_list_view(request: HttpRequest) -> JsonResponse:
    """List and filter payment requests (GET) or create a draft request (POST)."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."},
            status=401,
        )

    if request.method == "GET":
        vendor_id = request.GET.get("vendor_id")
        vendor = request.GET.get("vendor")
        status = request.GET.get("status")
        requester_id = request.GET.get("requester_id")
        requester = request.GET.get("requester")
        project_id = request.GET.get("project_id")
        project = request.GET.get("project")
        date_from = (
            request.GET.get("date_from")
            or request.GET.get("created_after")
            or request.GET.get("start_date")
        )
        date_to = (
            request.GET.get("date_to")
            or request.GET.get("created_before")
            or request.GET.get("end_date")
        )
        payment_method = request.GET.get("payment_method")
        min_amount = request.GET.get("min_amount")
        max_amount = request.GET.get("max_amount")
        search_query = request.GET.get("q") or request.GET.get("search")

        try:
            qs = services.filter_payment_requests(
                user=request.user,
                vendor_id=vendor_id,
                vendor=vendor,
                status=status,
                requester_id=requester_id,
                requester=requester,
                project_id=project_id,
                project=project,
                date_from=date_from,
                date_to=date_to,
                payment_method=payment_method,
                min_amount=min_amount,
                max_amount=max_amount,
                search_query=search_query,
            )
        except ValueError as exc:
            return JsonResponse({"detail": str(exc)}, status=400)

        try:
            limit = int(request.GET.get("limit", 100))
            limit = max(1, min(limit, 500))
        except ValueError:
            limit = 100

        count = qs.count()
        results = [payment_request_to_dict(req) for req in qs[:limit]]

        return JsonResponse(
            {
                "count": count,
                "results": results,
            },
            status=200,
        )

    try:
        payload = _parse_json_body(request)
        vendor_id_raw = payload.get("vendor_id")
        if not vendor_id_raw:
            return JsonResponse(
                {"error": {"vendor_id": "vendor_id is required."}}, status=400
            )

        vendor_uuid = uuid.UUID(str(vendor_id_raw))

        project_uuid: uuid.UUID | None = None
        if payload.get("project_id"):
            project_uuid = uuid.UUID(str(payload.get("project_id")))

        amount_raw = payload.get("amount")
        if amount_raw is None:
            return JsonResponse(
                {"error": {"amount": "amount is required."}}, status=400
            )
        amount = Decimal(str(amount_raw))

        req = services.create_payment_request(
            actor=authenticated_user(request),
            vendor_id=vendor_uuid,
            project_id=project_uuid,
            amount=amount,
            invoice_number=str(payload.get("invoice_number", "")),
            description=str(payload.get("description", "")),
            payment_method=str(payload.get("payment_method", PaymentMethod.MPESA)),
            supporting_notes=str(payload.get("supporting_notes", "")),
        )
        serialized = payment_request_to_dict(req)
        return JsonResponse(
            {"payment_request": serialized, **serialized},
            status=201,
        )
    except (ValueError, InvalidOperation) as exc:
        return JsonResponse({"error": f"Invalid input format: {exc}"}, status=400)
    except ValidationError as exc:
        message = (
            exc.message_dict
            if hasattr(exc, "message_dict")
            else exc.messages
            if hasattr(exc, "messages")
            else str(exc)
        )
        status_code = 409 if "already exists" in str(message).lower() else 400
        return JsonResponse({"error": message}, status=status_code)
    except PermissionDenied as exc:
        return JsonResponse({"error": str(exc)}, status=403)


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH"])
def payment_request_detail_view(
    request: HttpRequest,
    pk: uuid.UUID | None = None,
    payment_id: uuid.UUID | None = None,
) -> JsonResponse:
    """Retrieve (GET) or update (PUT/PATCH) a single payment request."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."},
            status=401,
        )

    target_id = pk or payment_id
    if target_id is None:
        return JsonResponse({"detail": "Payment request not found."}, status=404)
    try:
        req = PaymentRequest.objects.select_related(
            "vendor", "project", "requester"
        ).get(pk=target_id)
    except PaymentRequest.DoesNotExist:
        return JsonResponse({"detail": "Payment request not found."}, status=404)

    if not can_view_payment_request(request.user, req):
        return JsonResponse(
            {"detail": "You do not have permission to view this payment request."},
            status=403,
        )

    if request.method == "GET":
        serialized = payment_request_to_dict(req)
        return JsonResponse({"payment_request": serialized, **serialized}, status=200)

    try:
        payload = _parse_json_body(request)
        updated = services.update_payment_request(
            req,
            actor=authenticated_user(request),
            **payload,
        )
        serialized = payment_request_to_dict(updated)
        return JsonResponse(
            {"payment_request": serialized, **serialized},
            status=200,
        )
    except (ValueError, InvalidOperation) as exc:
        return JsonResponse({"error": f"Invalid input format: {exc}"}, status=400)
    except ValidationError as exc:
        message = (
            exc.message_dict
            if hasattr(exc, "message_dict")
            else exc.messages
            if hasattr(exc, "messages")
            else str(exc)
        )
        status_code = 409 if "already exists" in str(message).lower() else 400
        return JsonResponse({"error": message}, status=status_code)
    except PermissionDenied as exc:
        return JsonResponse({"error": str(exc)}, status=403)


@csrf_exempt
@require_http_methods(["POST"])
def payment_request_submit_view(
    request: HttpRequest, payment_id: uuid.UUID
) -> JsonResponse:
    """Submit a DRAFT payment request for approval."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse({"error": "Authentication required."}, status=401)

    payment_request = PaymentRequest.objects.filter(id=payment_id).first()
    if payment_request is None:
        return JsonResponse({"error": "Payment request not found."}, status=404)

    try:
        submitted = services.submit_payment_request(
            payment_request,
            actor=authenticated_user(request),
        )
        return JsonResponse(
            {"payment_request": payment_request_to_dict(submitted)},
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


@csrf_exempt
@require_http_methods(["POST"])
def payment_request_process_view(
    request: HttpRequest, payment_id: uuid.UUID
) -> JsonResponse:
    """Process an approved payment request through the payment provider gateway."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse({"error": "Authentication required."}, status=401)

    idempotency_key = (
        request.headers.get("Idempotency-Key", "").strip()
        or request.META.get("HTTP_IDEMPOTENCY_KEY", "").strip()
    )

    if not idempotency_key and request.body:
        try:
            payload = _parse_json_body(request)
            idempotency_key = str(payload.get("idempotency_key", "")).strip()
        except ValidationError:
            pass

    if not idempotency_key:
        return JsonResponse(
            {"error": "Idempotency-Key header is required for payment processing."},
            status=400,
        )

    try:
        attempt, req = services.process_payment_request(
            payment_request_id=payment_id,
            idempotency_key=idempotency_key,
            actor=authenticated_user(request),
        )
        return JsonResponse(
            {
                "payment_attempt": payment_attempt_to_dict(attempt),
                "payment_request": payment_request_to_dict(req),
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
        is_conflict = "already been used for another" in str(message)
        return JsonResponse({"error": message}, status=409 if is_conflict else 400)
    except PermissionDenied as exc:
        return JsonResponse({"error": str(exc)}, status=403)


@csrf_exempt
@require_http_methods(["POST"])
def payment_attempt_reconcile_view(
    request: HttpRequest, attempt_id: uuid.UUID
) -> JsonResponse:
    """Reconcile an AMBIGUOUS payment attempt against authoritative provider status."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse({"error": "Authentication required."}, status=401)

    try:
        attempt, req = services.reconcile_payment_attempt(
            payment_attempt_id=attempt_id,
            actor=authenticated_user(request),
        )
        return JsonResponse(
            {
                "payment_attempt": payment_attempt_to_dict(attempt),
                "payment_request": payment_request_to_dict(req),
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
