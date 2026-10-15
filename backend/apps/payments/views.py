"""HTTP JSON API views for payment requests and search/filtering."""

from __future__ import annotations

import uuid
from typing import Any

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.payments import services
from apps.payments.models import PaymentRequest
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
        "project_id": str(req.project_id) if req.project_id else None,
        "project_name": req.project.name if req.project else None,
        "requester_id": str(req.requester_id) if req.requester_id else None,
        "requester_username": req.requester.username if req.requester else None,
        "amount": str(req.amount),
        "currency": req.currency,
        "invoice_number": req.invoice_number,
        "description": req.description,
        "payment_method": req.payment_method,
        "status": req.status,
        "rejection_reason": req.rejection_reason,
        "supporting_notes": req.supporting_notes,
        "created_at": req.created_at.isoformat() if req.created_at else None,
        "updated_at": req.updated_at.isoformat() if req.updated_at else None,
    }


@csrf_exempt
@require_http_methods(["GET"])
def payment_request_list_view(request: HttpRequest) -> JsonResponse:
    """List and filter payment requests with composable search criteria.

    Supports filtering across vendor, status, requester, project, date range,
    payment method, amount thresholds, and text search. Enforces role-based
    visibility so regular employees only see their own requests while finance
    and management view organization-wide records.
    """
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."},
            status=401,
        )

    # Extract query parameters
    vendor_id = request.GET.get("vendor_id")
    vendor = request.GET.get("vendor")
    status = request.GET.get("status")
    requester_id = request.GET.get("requester_id")
    requester = request.GET.get("requester")
    project_id = request.GET.get("project_id")
    project = request.GET.get("project")
    date_from = request.GET.get("date_from") or request.GET.get("created_after")
    date_to = request.GET.get("date_to") or request.GET.get("created_before")
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


@csrf_exempt
@require_http_methods(["GET"])
def payment_request_detail_view(request: HttpRequest, pk: uuid.UUID) -> JsonResponse:
    """Retrieve detailed information for a single payment request."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."},
            status=401,
        )

    try:
        req = PaymentRequest.objects.select_related(
            "vendor", "project", "requester"
        ).get(pk=pk)
    except PaymentRequest.DoesNotExist:
        return JsonResponse({"detail": "Payment request not found."}, status=404)

    if not can_view_payment_request(request.user, req):
        return JsonResponse(
            {"detail": "You do not have permission to view this payment request."},
            status=403,
        )

    return JsonResponse(payment_request_to_dict(req), status=200)
