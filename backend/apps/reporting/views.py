"""HTTP JSON API views for financial metrics and reporting."""

from __future__ import annotations

from datetime import datetime, time
from typing import Any

from django.core.exceptions import ValidationError
from django.http import HttpRequest, JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from apps.accounts.models import UserRole
from apps.reporting import services


def _can_view_reports(user: Any) -> bool:
    """Check if the user is authorized to access financial reports."""
    if not getattr(user, "is_authenticated", False) or not getattr(
        user, "is_active", False
    ):
        return False
    if getattr(user, "is_superuser", False):
        return True
    return getattr(user, "role", None) in (
        UserRole.FINANCE_OFFICER,
        UserRole.MANAGER,
        UserRole.ADMINISTRATOR,
    )


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


@require_http_methods(["GET"])
def summary_report_view(request: HttpRequest) -> JsonResponse:
    """Retrieve aggregate payment summary metrics for the organization.

    Permissions:
        Managers, Finance Officers, and Administrators only.
    Status Codes:
        200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if not _can_view_reports(request.user):
        return JsonResponse(
            {"error": "Permission denied to view financial reports."}, status=403
        )

    start_date_str = request.GET.get("start_date", "").strip()
    end_date_str = request.GET.get("end_date", "").strip()

    try:
        start_date = (
            _parse_iso_datetime(start_date_str, is_end=False)
            if start_date_str
            else None
        )
        end_date = (
            _parse_iso_datetime(end_date_str, is_end=True) if end_date_str else None
        )
    except ValidationError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    summary = services.get_payment_summary_report(
        start_date=start_date,
        end_date=end_date,
    )
    return JsonResponse({"summary": summary}, status=200)


@require_http_methods(["GET"])
def project_breakdown_view(request: HttpRequest) -> JsonResponse:
    """Retrieve payment totals broken down by project.

    Permissions:
        Managers, Finance Officers, and Administrators only.
    Status Codes:
        200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if not _can_view_reports(request.user):
        return JsonResponse(
            {"error": "Permission denied to view financial reports."}, status=403
        )

    start_date_str = request.GET.get("start_date", "").strip()
    end_date_str = request.GET.get("end_date", "").strip()

    try:
        start_date = (
            _parse_iso_datetime(start_date_str, is_end=False)
            if start_date_str
            else None
        )
        end_date = (
            _parse_iso_datetime(end_date_str, is_end=True) if end_date_str else None
        )
    except ValidationError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    projects = services.get_project_breakdown_report(
        start_date=start_date,
        end_date=end_date,
    )
    return JsonResponse({"projects": projects}, status=200)
