"""Application services for financial metrics and management reporting."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any

from django.db.models import Count, Q, Sum

from apps.payments.models import PaymentRequest, PaymentRequestStatus
from apps.vendors.models import Project


def _format_currency(value: Any) -> str:
    """Format decimal monetary amount to two decimal places."""
    if value is None:
        return "0.00"
    return f"{Decimal(str(value)):.2f}"


def get_payment_summary_report(
    *,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> dict[str, Any]:
    """Calculate aggregated payment metrics across the organization.

    Aggregates paid totals, awaiting-approval count (SUBMITTED and PENDING_APPROVAL),
    and failed payments over an optional timezone-aware date range.
    """
    queryset = PaymentRequest.objects.all()
    if start_date is not None:
        queryset = queryset.filter(created_at__gte=start_date)
    if end_date is not None:
        queryset = queryset.filter(created_at__lt=end_date)

    aggregates = queryset.aggregate(
        total_paid=Sum(
            "amount",
            filter=Q(status=PaymentRequestStatus.PAID),
            default=Decimal("0.00"),
        ),
        total_failed=Sum(
            "amount",
            filter=Q(status=PaymentRequestStatus.FAILED),
            default=Decimal("0.00"),
        ),
    )

    paid_count = queryset.filter(status=PaymentRequestStatus.PAID).count()
    failed_count = queryset.filter(status=PaymentRequestStatus.FAILED).count()
    awaiting_approval_count = queryset.filter(
        status__in=(
            PaymentRequestStatus.SUBMITTED,
            PaymentRequestStatus.PENDING_APPROVAL,
        )
    ).count()

    return {
        "currency": "KES",
        "total_paid": _format_currency(aggregates["total_paid"]),
        "paid_count": paid_count,
        "awaiting_approval_count": awaiting_approval_count,
        "failed_count": failed_count,
        "total_failed": _format_currency(aggregates["total_failed"]),
        "period": {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None,
        },
    }


def get_project_breakdown_report(
    *,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> list[dict[str, Any]]:
    """Generate payment activity totals broken down by project.

    Returns paid totals, request counts, and project metadata, including
    an entry for payments not assigned to any specific project.
    """
    req_filter = Q()
    if start_date is not None:
        req_filter &= Q(payment_requests__created_at__gte=start_date)
    if end_date is not None:
        req_filter &= Q(payment_requests__created_at__lt=end_date)

    projects_qs = Project.objects.annotate(
        paid_amount=Sum(
            "payment_requests__amount",
            filter=req_filter & Q(payment_requests__status=PaymentRequestStatus.PAID),
            default=Decimal("0.00"),
        ),
        request_count=Count(
            "payment_requests",
            filter=req_filter,
        ),
    ).order_by("name")

    results: list[dict[str, Any]] = [
        {
            "project_id": str(p.id),
            "name": p.name,
            "code": p.code,
            "department": p.department,
            "total_paid": _format_currency(getattr(p, "paid_amount", Decimal("0.00"))),
            "request_count": getattr(p, "request_count", 0),
        }
        for p in projects_qs
    ]

    # Calculate unassigned (project=None) payments
    unassigned_qs = PaymentRequest.objects.filter(project__isnull=True)
    if start_date is not None:
        unassigned_qs = unassigned_qs.filter(created_at__gte=start_date)
    if end_date is not None:
        unassigned_qs = unassigned_qs.filter(created_at__lt=end_date)

    unassigned_agg = unassigned_qs.aggregate(
        paid_amount=Sum(
            "amount",
            filter=Q(status=PaymentRequestStatus.PAID),
            default=Decimal("0.00"),
        ),
        request_count=Count("id"),
    )

    if unassigned_agg["request_count"] > 0:
        results.append(
            {
                "project_id": None,
                "name": "General Operations (No Project)",
                "code": None,
                "department": "",
                "total_paid": _format_currency(unassigned_agg["paid_amount"]),
                "request_count": unassigned_agg["request_count"],
            }
        )

    return results
