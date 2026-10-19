"""Application service layer for financial and operational payment reporting."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from django.db.models import Count, Q, Sum
from django.db.models.functions import Coalesce

from apps.payments.models import PaymentRequest, PaymentRequestStatus
from apps.payments.services import parse_datetime_boundary
from apps.vendors.models import Project


def format_currency_amount(val: Any) -> str:
    """Format numeric or Decimal value into a standardized 2-decimal string."""
    if val is None:
        return "0.00"
    return f"{Decimal(str(val)):.2f}"


def get_payment_activity_summary(
    date_from: str | datetime | date | None = None,
    date_to: str | datetime | date | None = None,
) -> dict[str, Any]:
    """Calculate executive payment activity metrics constrained by period.

    Computes total paid amounts, requests awaiting approval, and failed payment
    totals across the organization.

    Args:
        date_from: Optional start date or ISO timestamp (inclusive).
        date_to: Optional end date or ISO timestamp (inclusive).

    Returns:
        Dictionary containing aggregated KPI counts and sums.
    """
    start_boundary = parse_datetime_boundary(date_from, is_end_of_day=False)
    end_boundary = parse_datetime_boundary(date_to, is_end_of_day=True)

    qs = PaymentRequest.objects.all()
    if start_boundary:
        qs = qs.filter(created_at__gte=start_boundary)
    if end_boundary:
        qs = qs.filter(created_at__lte=end_boundary)

    aggregates = qs.aggregate(
        total_paid_amount=Coalesce(
            Sum("amount", filter=Q(status=PaymentRequestStatus.PAID)),
            Decimal("0.00"),
        ),
        total_paid_count=Count("id", filter=Q(status=PaymentRequestStatus.PAID)),
        awaiting_approval_count=Count(
            "id",
            filter=Q(
                status__in=[
                    PaymentRequestStatus.PENDING_APPROVAL,
                    PaymentRequestStatus.SUBMITTED,
                ]
            ),
        ),
        awaiting_approval_amount=Coalesce(
            Sum(
                "amount",
                filter=Q(
                    status__in=[
                        PaymentRequestStatus.PENDING_APPROVAL,
                        PaymentRequestStatus.SUBMITTED,
                    ]
                ),
            ),
            Decimal("0.00"),
        ),
        failed_payment_count=Count("id", filter=Q(status=PaymentRequestStatus.FAILED)),
        failed_payment_amount=Coalesce(
            Sum("amount", filter=Q(status=PaymentRequestStatus.FAILED)),
            Decimal("0.00"),
        ),
        total_requests_count=Count("id"),
        total_requested_amount=Coalesce(Sum("amount"), Decimal("0.00")),
    )

    return {
        "total_paid_amount": format_currency_amount(aggregates["total_paid_amount"]),
        "total_paid_count": aggregates["total_paid_count"],
        "awaiting_approval_count": aggregates["awaiting_approval_count"],
        "awaiting_approval_amount": format_currency_amount(
            aggregates["awaiting_approval_amount"]
        ),
        "failed_payment_count": aggregates["failed_payment_count"],
        "failed_payment_amount": format_currency_amount(
            aggregates["failed_payment_amount"]
        ),
        "total_requests_count": aggregates["total_requests_count"],
        "total_requested_amount": format_currency_amount(
            aggregates["total_requested_amount"]
        ),
        "period": {
            "date_from": (start_boundary.isoformat() if start_boundary else None),
            "date_to": end_boundary.isoformat() if end_boundary else None,
        },
    }


def get_failed_payments_report(
    date_from: str | datetime | date | None = None,
    date_to: str | datetime | date | None = None,
    project_id: uuid.UUID | str | None = None,
    vendor_id: uuid.UUID | str | None = None,
) -> dict[str, Any]:
    """Retrieve detailed failure records and root-cause reasons.

    Args:
        date_from: Optional start date or ISO timestamp.
        date_to: Optional end date or ISO timestamp.
        project_id: Optional project UUID filter.
        vendor_id: Optional vendor UUID filter.

    Returns:
        Dictionary containing total failed amount, count, and detailed items.
    """
    start_boundary = parse_datetime_boundary(date_from, is_end_of_day=False)
    end_boundary = parse_datetime_boundary(date_to, is_end_of_day=True)

    qs = (
        PaymentRequest.objects.filter(status=PaymentRequestStatus.FAILED)
        .select_related("vendor", "project", "requester")
        .all()
    )

    if start_boundary:
        qs = qs.filter(created_at__gte=start_boundary)
    if end_boundary:
        qs = qs.filter(created_at__lte=end_boundary)

    if project_id:
        if isinstance(project_id, str):
            try:
                project_id = uuid.UUID(project_id.strip())
            except ValueError as exc:
                raise ValueError("Invalid project_id UUID format.") from exc
        qs = qs.filter(project_id=project_id)

    if vendor_id:
        if isinstance(vendor_id, str):
            try:
                vendor_id = uuid.UUID(vendor_id.strip())
            except ValueError as exc:
                raise ValueError("Invalid vendor_id UUID format.") from exc
        qs = qs.filter(vendor_id=vendor_id)

    aggregates = qs.aggregate(
        total_failed_amount=Coalesce(Sum("amount"), Decimal("0.00")),
        total_failed_count=Count("id"),
    )

    items = []
    for req in qs:
        reason = req.rejection_reason or req.supporting_notes or "Unknown error"
        items.append(
            {
                "id": str(req.id),
                "invoice_number": req.invoice_number,
                "amount": str(req.amount),
                "currency": req.currency,
                "vendor_id": str(req.vendor_id),
                "vendor_name": req.vendor.name if req.vendor else None,
                "project_id": str(req.project_id) if req.project_id else None,
                "project_name": req.project.name if req.project else None,
                "requester_id": (str(req.requester_id) if req.requester_id else None),
                "requester_username": (
                    req.requester.username if req.requester else None
                ),
                "payment_method": req.payment_method,
                "failure_reason": reason,
                "created_at": (req.created_at.isoformat() if req.created_at else None),
            }
        )

    return {
        "total_failed_amount": format_currency_amount(
            aggregates["total_failed_amount"]
        ),
        "total_failed_count": aggregates["total_failed_count"],
        "results": items,
        "period": {
            "date_from": (start_boundary.isoformat() if start_boundary else None),
            "date_to": end_boundary.isoformat() if end_boundary else None,
        },
    }


def get_payments_by_project_report(
    date_from: str | datetime | date | None = None,
    date_to: str | datetime | date | None = None,
) -> dict[str, Any]:
    """Group payment requests by project/department and calculate totals.

    Args:
        date_from: Optional start date or ISO timestamp.
        date_to: Optional end date or ISO timestamp.

    Returns:
        Dictionary containing project-grouped metrics and period context.
    """
    start_boundary = parse_datetime_boundary(date_from, is_end_of_day=False)
    end_boundary = parse_datetime_boundary(date_to, is_end_of_day=True)

    base_filter = Q()
    if start_boundary:
        base_filter &= Q(payment_requests__created_at__gte=start_boundary)
    if end_boundary:
        base_filter &= Q(payment_requests__created_at__lte=end_boundary)

    projects = Project.objects.annotate(
        total_amount=Coalesce(
            Sum("payment_requests__amount", filter=base_filter),
            Decimal("0.00"),
        ),
        paid_amount=Coalesce(
            Sum(
                "payment_requests__amount",
                filter=base_filter
                & Q(payment_requests__status=PaymentRequestStatus.PAID),
            ),
            Decimal("0.00"),
        ),
        pending_amount=Coalesce(
            Sum(
                "payment_requests__amount",
                filter=base_filter
                & Q(
                    payment_requests__status__in=[
                        PaymentRequestStatus.PENDING_APPROVAL,
                        PaymentRequestStatus.SUBMITTED,
                    ]
                ),
            ),
            Decimal("0.00"),
        ),
        total_count=Count("payment_requests", filter=base_filter),
        paid_count=Count(
            "payment_requests",
            filter=base_filter & Q(payment_requests__status=PaymentRequestStatus.PAID),
        ),
        pending_count=Count(
            "payment_requests",
            filter=base_filter
            & Q(
                payment_requests__status__in=[
                    PaymentRequestStatus.PENDING_APPROVAL,
                    PaymentRequestStatus.SUBMITTED,
                ]
            ),
        ),
    ).order_by("-total_amount", "name")

    results = []
    for p in projects:
        results.append(
            {
                "project_id": str(p.id),
                "project_name": p.name,
                "project_code": p.code,
                "department": p.department,
                "total_amount": format_currency_amount(p.total_amount),
                "paid_amount": format_currency_amount(p.paid_amount),
                "pending_amount": format_currency_amount(p.pending_amount),
                "total_count": p.total_count,
                "paid_count": p.paid_count,
                "pending_count": p.pending_count,
            }
        )

    return {
        "count": len(results),
        "results": results,
        "period": {
            "date_from": (start_boundary.isoformat() if start_boundary else None),
            "date_to": end_boundary.isoformat() if end_boundary else None,
        },
    }
