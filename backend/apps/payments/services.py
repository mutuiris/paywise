"""Application service layer for payment request search and filtering."""

from __future__ import annotations

import uuid
from datetime import date, datetime, time, tzinfo
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from django.db.models import Q, QuerySet
from django.utils import timezone

from apps.payments.models import PaymentRequest
from apps.payments.permissions import can_view_all_payments

if TYPE_CHECKING:
    from apps.accounts.models import UserAccount


def parse_datetime_boundary(
    value: str | datetime | date | None,
    *,
    is_end_of_day: bool = False,
    tz: tzinfo | None = None,
) -> datetime | None:
    """Parse a date or ISO datetime string into a deterministic timezone-aware datetime.

    If given a string representing a calendar date (YYYY-MM-DD), sets the time
    component to 00:00:00.000000 (start of day) or 23:59:59.999999 (end of day)
    depending on the is_end_of_day parameter, and converts it to a timezone-aware
    datetime object.

    Args:
        value: Input string, datetime, date, or None.
        is_end_of_day: If True and input has no time component, sets time to
            the end of day (23:59:59.999999).
        tz: Optional timezone to assume for naive values (defaults to Django's
            active timezone).

    Returns:
        Timezone-aware datetime object, or None if value is empty/None.

    Raises:
        ValueError: If value is an unparseable string.
    """
    if value is None:
        return None

    active_tz = tz or timezone.get_current_timezone()

    if isinstance(value, datetime):
        if timezone.is_naive(value):
            return timezone.make_aware(value, active_tz)
        return value

    if isinstance(value, date):
        boundary_time = time(23, 59, 59, 999999) if is_end_of_day else time.min
        combined = datetime.combine(value, boundary_time)
        return timezone.make_aware(combined, active_tz)

    str_val = str(value).strip()
    if not str_val:
        return None

    # Check for calendar date YYYY-MM-DD
    if len(str_val) == 10 and str_val.count("-") == 2:
        try:
            parsed_date = date.fromisoformat(str_val)
            boundary_time = time(23, 59, 59, 999999) if is_end_of_day else time.min
            combined = datetime.combine(parsed_date, boundary_time)
            return timezone.make_aware(combined, active_tz)
        except ValueError:
            pass

    # Attempt full ISO-8601 parsing
    try:
        dt = datetime.fromisoformat(str_val)
        if timezone.is_naive(dt):
            return timezone.make_aware(dt, active_tz)
        return dt
    except ValueError as exc:
        raise ValueError(
            f"Invalid date/time format '{str_val}'. Expected YYYY-MM-DD or ISO-8601."
        ) from exc


def filter_payment_requests(
    queryset: QuerySet[PaymentRequest] | None = None,
    *,
    user: UserAccount | Any | None = None,
    vendor_id: uuid.UUID | str | None = None,
    vendor: str | None = None,
    status: str | list[str] | None = None,
    requester_id: uuid.UUID | str | None = None,
    requester: str | None = None,
    project_id: uuid.UUID | str | None = None,
    project: str | None = None,
    date_from: str | datetime | date | None = None,
    date_to: str | datetime | date | None = None,
    payment_method: str | list[str] | None = None,
    min_amount: Decimal | str | float | int | None = None,
    max_amount: Decimal | str | float | int | None = None,
    search_query: str | None = None,
) -> QuerySet[PaymentRequest]:
    """Filter payment requests using composable criteria and deterministic dates.

    Enforces permission scoping: Finance Officers, Managers, and Administrators
    can query all payment requests across the organization. Regular employees
    are strictly scoped to their own payment requests.

    Args:
        queryset: Optional base QuerySet; defaults to all PaymentRequests with
            select_related optimization on related entities.
        user: Requesting actor used to enforce permission-scoped visibility.
        vendor_id: UUID of the vendor to filter by.
        vendor: Case-insensitive substring match against vendor name.
        status: Single status string, list of statuses, or comma-separated string.
        requester_id: UUID of the requester to filter by.
        requester: Case-insensitive substring match on requester username or name.
        project_id: UUID of the project/department to filter by.
        project: Substring or code match on project name or code.
        date_from: Timezone-aware lower creation bound (inclusive).
        date_to: Timezone-aware upper creation bound (inclusive).
        payment_method: Filter by payment method enum value or list of methods.
        min_amount: Minimum request amount (inclusive).
        max_amount: Maximum request amount (inclusive).
        search_query: Text search across invoice number, description, vendor,
            and project.

    Returns:
        Filtered PaymentRequest QuerySet.
    """
    if queryset is None:
        queryset = PaymentRequest.objects.select_related(
            "vendor", "project", "requester"
        ).all()

    # Apply role-based scoping: employees only see their own requests
    if user is not None and not can_view_all_payments(user):
        user_id = getattr(user, "id", None)
        if user_id:
            queryset = queryset.filter(Q(requester=user) | Q(created_by=user_id))
        else:
            queryset = queryset.filter(requester=user)

    # Vendor filters
    if vendor_id:
        if isinstance(vendor_id, str):
            try:
                vendor_id = uuid.UUID(vendor_id.strip())
            except ValueError as exc:
                raise ValueError("Invalid vendor_id UUID format.") from exc
        queryset = queryset.filter(vendor_id=vendor_id)

    if vendor and str(vendor).strip():
        queryset = queryset.filter(vendor__name__icontains=str(vendor).strip())

    # Status filters
    if status:
        if isinstance(status, str):
            if "," in status:
                statuses = [s.strip().upper() for s in status.split(",") if s.strip()]
                queryset = queryset.filter(status__in=statuses)
            elif status.strip():
                queryset = queryset.filter(status=status.strip().upper())
        elif isinstance(status, (list, tuple, set)):
            statuses = [str(s).strip().upper() for s in status if str(s).strip()]
            if statuses:
                queryset = queryset.filter(status__in=statuses)

    # Requester filters
    if requester_id:
        if isinstance(requester_id, str):
            try:
                requester_id = uuid.UUID(requester_id.strip())
            except ValueError as exc:
                raise ValueError("Invalid requester_id UUID format.") from exc
        queryset = queryset.filter(requester_id=requester_id)

    if requester and str(requester).strip():
        req_pattern = str(requester).strip()
        queryset = queryset.filter(
            Q(requester__username__icontains=req_pattern)
            | Q(requester__first_name__icontains=req_pattern)
            | Q(requester__last_name__icontains=req_pattern)
            | Q(requester__email__icontains=req_pattern)
        )

    # Project filters
    if project_id:
        if isinstance(project_id, str):
            try:
                project_id = uuid.UUID(project_id.strip())
            except ValueError as exc:
                raise ValueError("Invalid project_id UUID format.") from exc
        queryset = queryset.filter(project_id=project_id)

    if project and str(project).strip():
        proj_pattern = str(project).strip()
        queryset = queryset.filter(
            Q(project__name__icontains=proj_pattern)
            | Q(project__code__iexact=proj_pattern)
        )

    # Date range filters (deterministic and timezone-aware)
    if date_from:
        start_boundary = parse_datetime_boundary(date_from, is_end_of_day=False)
        if start_boundary:
            queryset = queryset.filter(created_at__gte=start_boundary)

    if date_to:
        end_boundary = parse_datetime_boundary(date_to, is_end_of_day=True)
        if end_boundary:
            queryset = queryset.filter(created_at__lte=end_boundary)

    # Payment method filters
    if payment_method:
        if isinstance(payment_method, str):
            if "," in payment_method:
                methods = [
                    m.strip().upper() for m in payment_method.split(",") if m.strip()
                ]
                queryset = queryset.filter(payment_method__in=methods)
            elif payment_method.strip():
                queryset = queryset.filter(
                    payment_method=payment_method.strip().upper()
                )
        elif isinstance(payment_method, (list, tuple, set)):
            methods = [str(m).strip().upper() for m in payment_method if str(m).strip()]
            if methods:
                queryset = queryset.filter(payment_method__in=methods)

    # Amount filters
    if min_amount is not None and str(min_amount).strip():
        try:
            min_dec = Decimal(str(min_amount).strip())
            queryset = queryset.filter(amount__gte=min_dec)
        except Exception as exc:
            raise ValueError(
                f"Invalid min_amount decimal value '{min_amount}'."
            ) from exc

    if max_amount is not None and str(max_amount).strip():
        try:
            max_dec = Decimal(str(max_amount).strip())
            queryset = queryset.filter(amount__lte=max_dec)
        except Exception as exc:
            raise ValueError(
                f"Invalid max_amount decimal value '{max_amount}'."
            ) from exc

    # Free-text search
    if search_query and str(search_query).strip():
        query_pattern = str(search_query).strip()
        queryset = queryset.filter(
            Q(invoice_number__icontains=query_pattern)
            | Q(description__icontains=query_pattern)
            | Q(vendor__name__icontains=query_pattern)
            | Q(project__name__icontains=query_pattern)
            | Q(project__code__icontains=query_pattern)
        )

    return queryset
