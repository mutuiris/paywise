"""HTTP JSON API views for payment request lifecycle and processing."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, time
from decimal import Decimal, InvalidOperation
from typing import Any

from django.core.exceptions import PermissionDenied, ValidationError
from django.core.paginator import Paginator
from django.db import models
from django.http import HttpRequest, JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from apps.accounts.models import UserRole
from apps.core.security import authenticated_user
from apps.payments import services
from apps.payments.models import (
    PaymentAttempt,
    PaymentMethod,
    PaymentRequest,
    PaymentRequestStatus,
)


def payment_request_to_dict(payment_request: PaymentRequest) -> dict[str, Any]:
    """Serialize a PaymentRequest model instance into a JSON-compatible dictionary."""
    return {
        "id": str(payment_request.id),
        "vendor": {
            "id": str(payment_request.vendor_id),
            "name": payment_request.vendor.name if payment_request.vendor else None,
        },
        "project": {
            "id": str(payment_request.project_id),
            "name": payment_request.project.name,
            "code": payment_request.project.code,
        }
        if payment_request.project_id and payment_request.project
        else None,
        "requester": {
            "id": str(payment_request.requester_id),
            "username": payment_request.requester.username
            if payment_request.requester
            else None,
        }
        if payment_request.requester_id
        else None,
        "amount": str(payment_request.amount),
        "currency": payment_request.currency,
        "invoice_number": payment_request.invoice_number,
        "description": payment_request.description,
        "payment_method": payment_request.payment_method,
        "status": payment_request.status,
        "rejection_reason": payment_request.rejection_reason,
        "supporting_notes": payment_request.supporting_notes,
        "is_active": payment_request.is_active,
        "created_at": payment_request.created_at.isoformat()
        if payment_request.created_at
        else None,
        "updated_at": payment_request.updated_at.isoformat()
        if payment_request.updated_at
        else None,
        "created_by": str(payment_request.created_by)
        if payment_request.created_by
        else None,
        "updated_by": str(payment_request.updated_by)
        if payment_request.updated_by
        else None,
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


def _parse_iso_datetime(value: str, is_end: bool = False) -> datetime:
    """Parse an ISO 8601 date or datetime string into a timezone-aware datetime."""
    clean_val = value.strip()
    try:
        if "T" in clean_val:
            dt = datetime.fromisoformat(clean_val)
        else:
            d = datetime.strptime(clean_val, "%Y-%m-%d").date()
            dt = datetime.combine(d, time.max if is_end else time.min)

        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt, timezone.get_current_timezone())
        return dt
    except ValueError as exc:
        raise ValidationError(
            f"Invalid date format '{value}'. Use YYYY-MM-DD or ISO 8601."
        ) from exc


@require_http_methods(["GET", "POST"])
def payment_request_list_create_view(request: HttpRequest) -> JsonResponse:
    """List filtered payment requests (GET) or create a draft (POST).

    Methods:
        GET: Returns paginated payment requests.
            Role visibility:
                Employees only see their own requests.
                Managers, Finance Officers, and Administrators see all requests.
            Query Parameters:
                vendor (uuid): Vendor UUID filter.
                project (uuid): Project UUID filter.
                requester (uuid): Requester UUID filter.
                status (str): PaymentRequestStatus choice.
                payment_method (str): PaymentMethod choice.
                start_date (str): Inclusive ISO date/time filter.
                end_date (str): Exclusive ISO date/time filter.
                search (str): Invoice number or description substring.
                page (int): Page number (default 1).
                page_size (int): Items per page (default 20, max 100).
            Status Codes: 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden.

        POST: Creates a draft payment request.
            Payload:
                vendor_id (uuid, required): Destination vendor.
                amount (numeric, required): Amount in KES.
                invoice_number (str, required): Unique invoice identifier.
                description (str, required): Work or item description.
                project_id (uuid, optional): Associated project.
                payment_method (str, optional): Default MPESA.
                supporting_notes (str, optional): Additional context notes.
            Status Codes: 201 Created, 400 Bad Request, 401 Unauthorized,
            403 Forbidden, 409 Conflict.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if not request.user.is_active:
        return JsonResponse({"error": "Account is inactive."}, status=401)

    if request.method == "GET":
        queryset = PaymentRequest.objects.select_related(
            "vendor", "project", "requester"
        ).all()

        role = getattr(request.user, "role", None)
        if (
            not getattr(request.user, "is_superuser", False)
            and role == UserRole.EMPLOYEE
        ):
            queryset = queryset.filter(requester=request.user)

        try:
            vendor_id = request.GET.get("vendor", "").strip()
            if vendor_id:
                queryset = queryset.filter(vendor_id=uuid.UUID(vendor_id))

            project_id = request.GET.get("project", "").strip()
            if project_id:
                queryset = queryset.filter(project_id=uuid.UUID(project_id))

            requester_id = request.GET.get("requester", "").strip()
            if requester_id:
                queryset = queryset.filter(requester_id=uuid.UUID(requester_id))

            status_filter = request.GET.get("status", "").strip()
            if status_filter:
                if status_filter not in PaymentRequestStatus.values:
                    return JsonResponse(
                        {"error": f"Invalid status '{status_filter}'."}, status=400
                    )
                queryset = queryset.filter(status=status_filter)

            method_filter = request.GET.get("payment_method", "").strip()
            if method_filter:
                if method_filter not in PaymentMethod.values:
                    return JsonResponse(
                        {"error": f"Invalid payment_method '{method_filter}'."},
                        status=400,
                    )
                queryset = queryset.filter(payment_method=method_filter)

            start_date_str = request.GET.get("start_date", "").strip()
            if start_date_str:
                dt_start = _parse_iso_datetime(start_date_str, is_end=False)
                queryset = queryset.filter(created_at__gte=dt_start)

            end_date_str = request.GET.get("end_date", "").strip()
            if end_date_str:
                dt_end = _parse_iso_datetime(end_date_str, is_end=True)
                queryset = queryset.filter(created_at__lt=dt_end)

            search = request.GET.get("search", "").strip()
            if search:
                queryset = queryset.filter(
                    models.Q(invoice_number__icontains=search)
                    | models.Q(description__icontains=search)
                )

            page_size = min(max(int(request.GET.get("page_size", 20)), 1), 100)
            page_number = max(int(request.GET.get("page", 1)), 1)
        except (ValueError, ValidationError) as exc:
            return JsonResponse({"error": str(exc)}, status=400)

        queryset = queryset.order_by("-created_at")
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page_number)

        return JsonResponse(
            {
                "count": paginator.count,
                "num_pages": paginator.num_pages,
                "page": page_obj.number,
                "results": [payment_request_to_dict(req) for req in page_obj],
            },
            status=200,
        )

    # POST - Create draft request
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
        return JsonResponse(
            {"payment_request": payment_request_to_dict(req)}, status=201
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


@require_http_methods(["GET", "PUT", "PATCH"])
def payment_request_detail_update_view(
    request: HttpRequest, payment_id: uuid.UUID
) -> JsonResponse:
    """Retrieve (GET) or update (PUT/PATCH) an individual payment request by UUID."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if not request.user.is_active:
        return JsonResponse({"error": "Account is inactive."}, status=401)

    user = authenticated_user(request)
    payment_request = (
        PaymentRequest.objects.select_related("vendor", "project", "requester")
        .filter(id=payment_id)
        .first()
    )
    if payment_request is None:
        return JsonResponse({"error": "Payment request not found."}, status=404)

    role = getattr(request.user, "role", None)
    is_employee = (
        not getattr(request.user, "is_superuser", False) and role == UserRole.EMPLOYEE
    )
    if (
        is_employee
        and payment_request.requester_id != user.id
        and payment_request.created_by != user.id
    ):
        return JsonResponse({"error": "Payment request not found."}, status=404)

    if request.method == "GET":
        return JsonResponse(
            {"payment_request": payment_request_to_dict(payment_request)},
            status=200,
        )

    # PUT or PATCH
    try:
        payload = _parse_json_body(request)
        updated = services.update_payment_request(
            payment_request,
            actor=authenticated_user(request),
            **payload,
        )
        return JsonResponse(
            {"payment_request": payment_request_to_dict(updated)},
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


@require_http_methods(["POST"])
def payment_request_submit_view(
    request: HttpRequest, payment_id: uuid.UUID
) -> JsonResponse:
    """Submit a DRAFT payment request for approval."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if not request.user.is_active:
        return JsonResponse({"error": "Account is inactive."}, status=401)

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


@require_http_methods(["POST"])
def payment_request_process_view(
    request: HttpRequest, payment_id: uuid.UUID
) -> JsonResponse:
    """Process an approved payment request through the payment provider gateway."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if not request.user.is_active:
        return JsonResponse({"error": "Account is inactive."}, status=401)

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


@require_http_methods(["POST"])
def payment_attempt_reconcile_view(
    request: HttpRequest, attempt_id: uuid.UUID
) -> JsonResponse:
    """Reconcile an AMBIGUOUS payment attempt against authoritative provider status."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if not request.user.is_active:
        return JsonResponse({"error": "Account is inactive."}, status=401)

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
