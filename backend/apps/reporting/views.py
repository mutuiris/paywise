"""HTTP JSON API views for management and finance payment activity reporting."""

from __future__ import annotations

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods

from apps.reporting import services
from apps.reporting.permissions import (
    can_view_reports,
    is_active_authenticated_user,
)


@require_http_methods(["GET"])
def activity_summary_view(request: HttpRequest) -> JsonResponse:
    """Return high-level payment activity KPIs and summary metrics."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."},
            status=401,
        )
    if not can_view_reports(request.user):
        return JsonResponse(
            {
                "detail": (
                    "Only Managers, Finance Officers, and Administrators can "
                    "view payment reports."
                )
            },
            status=403,
        )

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

    try:
        report = services.get_payment_activity_summary(
            date_from=date_from, date_to=date_to
        )
    except ValueError as exc:
        return JsonResponse({"detail": str(exc)}, status=400)

    return JsonResponse(report, status=200)


@require_http_methods(["GET"])
def failed_payments_view(request: HttpRequest) -> JsonResponse:
    """Return queryable records of failed payments with root cause reasons."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."},
            status=401,
        )
    if not can_view_reports(request.user):
        return JsonResponse(
            {
                "detail": (
                    "Only Managers, Finance Officers, and Administrators can "
                    "view payment reports."
                )
            },
            status=403,
        )

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
    project_id = request.GET.get("project_id")
    vendor_id = request.GET.get("vendor_id")

    try:
        report = services.get_failed_payments_report(
            date_from=date_from,
            date_to=date_to,
            project_id=project_id,
            vendor_id=vendor_id,
        )
    except ValueError as exc:
        return JsonResponse({"detail": str(exc)}, status=400)

    return JsonResponse(report, status=200)


@require_http_methods(["GET"])
def projects_breakdown_view(request: HttpRequest) -> JsonResponse:
    """Return payments grouped by organizational project and period."""
    if not is_active_authenticated_user(request.user):
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."},
            status=401,
        )
    if not can_view_reports(request.user):
        return JsonResponse(
            {
                "detail": (
                    "Only Managers, Finance Officers, and Administrators can "
                    "view payment reports."
                )
            },
            status=403,
        )

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

    try:
        report = services.get_payments_by_project_report(
            date_from=date_from, date_to=date_to
        )
    except ValueError as exc:
        return JsonResponse({"detail": str(exc)}, status=400)

    return JsonResponse(report, status=200)
