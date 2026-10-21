"""Application services for payment request lifecycle, processing, and search."""

from __future__ import annotations

import uuid
from datetime import date, datetime, time, tzinfo
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import IntegrityError, transaction
from django.db.models import Q, QuerySet
from django.utils import timezone

from apps.accounts.models import UserRole
from apps.approvals import services as approval_services
from apps.audit import services as audit_services
from apps.payments.models import (
    PaymentAttempt,
    PaymentAttemptStatus,
    PaymentMethod,
    PaymentRequest,
    PaymentRequestStatus,
)
from apps.payments.permissions import can_view_all_payments
from apps.payments.providers import (
    PaymentProvider,
    PaymentProviderError,
    get_payment_provider,
)
from apps.payments.providers.base import ProviderPaymentResult
from apps.vendors.models import Project, Vendor
from apps.vendors.services import (
    validate_project_for_payment,
    validate_vendor_for_payment,
)

if TYPE_CHECKING:
    from apps.accounts.models import UserAccount


def create_payment_request(
    *,
    actor: UserAccount,
    vendor_id: uuid.UUID,
    amount: Decimal,
    invoice_number: str,
    description: str,
    project_id: uuid.UUID | None = None,
    payment_method: str = PaymentMethod.MPESA,
    supporting_notes: str = "",
) -> PaymentRequest:
    """Create a new payment request in DRAFT status.

    Validates that the referenced vendor and optional project are active,
    derives ownership strictly from the authenticated actor, and ensures
    uniqueness of (vendor, invoice_number).
    """
    if not getattr(actor, "is_active", False):
        raise PermissionDenied("Inactive users cannot create payment requests.")

    clean_invoice = invoice_number.strip()
    if not clean_invoice:
        raise ValidationError({"invoice_number": "Invoice number cannot be empty."})

    clean_description = description.strip()
    if not clean_description:
        raise ValidationError({"description": "Description cannot be empty."})

    if amount <= Decimal("0.00"):
        raise ValidationError({"amount": "Amount must be greater than zero."})

    vendor = Vendor.objects.filter(id=vendor_id).first()
    if vendor is None:
        raise ValidationError({"vendor": "Vendor not found."})
    validate_vendor_for_payment(vendor)

    project: Project | None = None
    if project_id is not None:
        project = Project.objects.filter(id=project_id).first()
        if project is None:
            raise ValidationError({"project": "Project not found."})
        validate_project_for_payment(project)

    try:
        with transaction.atomic():
            payment_request = PaymentRequest(
                vendor=vendor,
                project=project,
                requester=actor,
                amount=amount,
                currency="KES",
                invoice_number=clean_invoice,
                description=clean_description,
                payment_method=payment_method,
                status=PaymentRequestStatus.DRAFT,
                supporting_notes=supporting_notes.strip(),
                created_by=actor.id,
                updated_by=actor.id,
            )
            payment_request.save()

            audit_services.record_payment_request_created(
                actor=actor,
                payment_request_id=payment_request.id,
                metadata={
                    "invoice_number": clean_invoice,
                    "amount": str(amount),
                    "vendor": vendor.name,
                    "payment_method": payment_method,
                },
            )
            return payment_request
    except IntegrityError as exc:
        if "unique_vendor_invoice_number" in str(exc) or "invoice_number" in str(exc):
            raise ValidationError(
                {
                    "invoice_number": (
                        f"Invoice '{clean_invoice}' already exists for vendor "
                        f"'{vendor.name}'."
                    )
                }
            ) from exc
        raise ValidationError(f"Database integrity error: {exc}") from exc


def submit_payment_request(
    payment_request: PaymentRequest,
    *,
    actor: UserAccount,
) -> PaymentRequest:
    """Submit a DRAFT payment request for approval.

    Transitions status from DRAFT to SUBMITTED and emits an audit event.
    Only the requester, creator, or an administrator may submit a request.
    """
    if not getattr(actor, "is_active", False):
        raise PermissionDenied("Inactive users cannot submit payment requests.")

    is_creator_or_requester = actor.id in (
        payment_request.requester_id,
        payment_request.created_by,
    )
    is_admin = (
        getattr(actor, "is_superuser", False)
        or getattr(actor, "role", None) == UserRole.ADMINISTRATOR
    )

    if not (is_creator_or_requester or is_admin):
        raise PermissionDenied(
            "Only the requester or creator can submit this payment request."
        )

    if payment_request.status != PaymentRequestStatus.DRAFT:
        raise ValidationError(
            {
                "status": (
                    f"Cannot submit payment request with status "
                    f"'{payment_request.status}'. Only DRAFT requests can "
                    "be submitted."
                )
            }
        )

    with transaction.atomic():
        payment_request.status = PaymentRequestStatus.SUBMITTED
        payment_request.updated_by = actor.id
        payment_request.save()

        audit_services.record_payment_request_submitted(
            actor=actor,
            payment_request_id=payment_request.id,
            metadata={
                "amount": str(payment_request.amount),
                "invoice_number": payment_request.invoice_number,
            },
        )
        return payment_request


def update_payment_request(
    payment_request: PaymentRequest,
    *,
    actor: UserAccount,
    **fields: Any,
) -> PaymentRequest:
    """Update editable payment request fields.

    DRAFT requests permit modification of vendor, project, amount, invoice number,
    description, payment method, and notes.

    Modifying amount on an already approved request invalidates existing approvals
    and reverts the status to PENDING_APPROVAL.
    """
    if not getattr(actor, "is_active", False):
        raise PermissionDenied("Inactive users cannot update payment requests.")

    is_creator_or_requester = actor.id in (
        payment_request.requester_id,
        payment_request.created_by,
    )
    is_manager = getattr(actor, "role", None) in (
        UserRole.MANAGER,
        UserRole.FINANCE_OFFICER,
        UserRole.ADMINISTRATOR,
    )
    if not (
        is_creator_or_requester or is_manager or getattr(actor, "is_superuser", False)
    ):
        raise PermissionDenied("Permission denied to update this payment request.")

    if payment_request.status in (
        PaymentRequestStatus.PROCESSING,
        PaymentRequestStatus.PAID,
        PaymentRequestStatus.FAILED,
        PaymentRequestStatus.REJECTED,
    ):
        raise ValidationError(
            {
                "status": (
                    "Cannot update payment request with finalized status "
                    f"'{payment_request.status}'."
                )
            }
        )

    allowed_fields = {
        "vendor_id",
        "project_id",
        "amount",
        "invoice_number",
        "description",
        "payment_method",
        "supporting_notes",
    }

    try:
        with transaction.atomic():
            old_amount = payment_request.amount
            old_status = payment_request.status
            amount_changed = False

            for field, value in fields.items():
                if field not in allowed_fields:
                    continue

                if field == "vendor_id" and value is not None:
                    vendor = Vendor.objects.filter(id=value).first()
                    if vendor is None:
                        raise ValidationError({"vendor": "Vendor not found."})
                    validate_vendor_for_payment(vendor)
                    payment_request.vendor = vendor

                elif field == "project_id":
                    if value is not None:
                        project = Project.objects.filter(id=value).first()
                        if project is None:
                            raise ValidationError({"project": "Project not found."})
                        validate_project_for_payment(project)
                        payment_request.project = project
                    else:
                        payment_request.project = None

                elif field == "amount" and value is not None:
                    new_amount = Decimal(str(value))
                    if new_amount <= Decimal("0.00"):
                        raise ValidationError(
                            {"amount": "Amount must be greater than zero."}
                        )
                    if new_amount != old_amount:
                        payment_request.amount = new_amount
                        amount_changed = True

                elif field == "invoice_number" and isinstance(value, str):
                    clean_inv = value.strip()
                    if not clean_inv:
                        raise ValidationError(
                            {"invoice_number": "Invoice number cannot be empty."}
                        )
                    payment_request.invoice_number = clean_inv

                elif field == "description" and isinstance(value, str):
                    clean_desc = value.strip()
                    if not clean_desc:
                        raise ValidationError(
                            {"description": "Description cannot be empty."}
                        )
                    payment_request.description = clean_desc

                elif field == "payment_method" and isinstance(value, str):
                    payment_request.payment_method = value

                elif field == "supporting_notes" and isinstance(value, str):
                    payment_request.supporting_notes = value.strip()

            if amount_changed and old_status in (
                PaymentRequestStatus.PENDING_APPROVAL,
                PaymentRequestStatus.APPROVED,
            ):
                approval_services.invalidate_existing_approvals(
                    payment_request,
                    actor=actor,
                    reason=(
                        f"Amount changed from {old_amount} to {payment_request.amount}"
                    ),
                )
                payment_request.status = PaymentRequestStatus.PENDING_APPROVAL

            payment_request.updated_by = actor.id
            payment_request.save()

            return payment_request
    except IntegrityError as exc:
        if "unique_vendor_invoice_number" in str(exc) or "invoice_number" in str(exc):
            raise ValidationError(
                {
                    "invoice_number": (
                        f"Invoice '{payment_request.invoice_number}' already "
                        "exists for this vendor."
                    )
                }
            ) from exc
        raise ValidationError(f"Database integrity error: {exc}") from exc


def process_payment_request(
    *,
    payment_request_id: uuid.UUID,
    idempotency_key: str,
    actor: UserAccount,
    provider: PaymentProvider | None = None,
) -> tuple[PaymentAttempt, PaymentRequest]:
    """Execute payment processing through the payment provider idempotently.

    Enforces that only Finance Officers and Administrators can initiate processing,
    and only for requests in APPROVED status. Prevents duplicate provider executions
    via the unique idempotency key.
    """
    if not getattr(actor, "is_active", False):
        raise PermissionDenied("Inactive users cannot process payments.")

    role = getattr(actor, "role", None)
    is_finance = getattr(actor, "is_superuser", False) or role in (
        UserRole.FINANCE_OFFICER,
        UserRole.ADMINISTRATOR,
    )
    if not is_finance:
        raise PermissionDenied(
            "Only Finance Officers and Administrators can process payments."
        )

    clean_key = idempotency_key.strip()
    if not clean_key:
        raise ValidationError({"idempotency_key": "Idempotency key is required."})

    existing_attempt = PaymentAttempt.objects.filter(idempotency_key=clean_key).first()
    if existing_attempt is not None:
        if existing_attempt.payment_request_id != payment_request_id:
            raise ValidationError(
                {
                    "idempotency_key": (
                        "Idempotency key has already been used for another "
                        "payment request."
                    )
                }
            )
        return existing_attempt, existing_attempt.payment_request

    with transaction.atomic():
        payment_request = (
            PaymentRequest.objects.select_for_update()
            .filter(id=payment_request_id)
            .first()
        )
        if payment_request is None:
            raise ValidationError({"payment_request": "Payment request not found."})

        attempt_race = PaymentAttempt.objects.filter(idempotency_key=clean_key).first()
        if attempt_race is not None:
            if attempt_race.payment_request_id != payment_request_id:
                raise ValidationError(
                    {
                        "idempotency_key": (
                            "Idempotency key has already been used for another "
                            "payment request."
                        )
                    }
                )
            return attempt_race, payment_request

        if payment_request.status != PaymentRequestStatus.APPROVED:
            raise ValidationError(
                {
                    "status": (
                        f"Cannot process payment request with status "
                        f"'{payment_request.status}'. Only APPROVED requests "
                        "can be processed."
                    )
                }
            )

        payment_request.status = PaymentRequestStatus.PROCESSING
        payment_request.updated_by = actor.id
        payment_request.save()

        attempt = PaymentAttempt.objects.create(
            payment_request=payment_request,
            idempotency_key=clean_key,
            amount=payment_request.amount,
            currency=payment_request.currency,
            payment_method=payment_request.payment_method,
            status=PaymentAttemptStatus.PROCESSING,
            created_by=actor.id,
            updated_by=actor.id,
        )

        audit_services.record_payment_processing_started(
            actor=actor,
            payment_request_id=payment_request.id,
            metadata={
                "idempotency_key": clean_key,
                "amount": str(payment_request.amount),
            },
        )

    payment_provider = provider or get_payment_provider()
    try:
        result = payment_provider.process_payment(
            payment_request_id=payment_request.id,
            amount=payment_request.amount,
            currency=payment_request.currency,
            payment_method=payment_request.payment_method,
            destination_details=payment_request.vendor.payment_details,
            idempotency_key=clean_key,
        )
    except (PaymentProviderError, TimeoutError, ConnectionError) as exc:
        result = ProviderPaymentResult(
            status=PaymentAttemptStatus.AMBIGUOUS,
            provider_reference="",
            failure_reason="Provider outcome requires reconciliation.",
            metadata={"error_type": type(exc).__name__},
        )

    with transaction.atomic():
        attempt.refresh_from_db()
        attempt.provider_reference = result.provider_reference
        attempt.failure_reason = result.failure_reason
        attempt.metadata = result.metadata
        attempt.status = result.status
        attempt.updated_by = actor.id
        attempt.save()

        payment_request.refresh_from_db()
        if result.status == PaymentAttemptStatus.SUCCESS:
            payment_request.status = PaymentRequestStatus.PAID
            payment_request.updated_by = actor.id
            payment_request.save()
            audit_services.record_payment_completed(
                actor=actor,
                payment_request_id=payment_request.id,
                metadata={
                    "provider_reference": result.provider_reference,
                    "amount": str(payment_request.amount),
                },
            )

        elif result.status == PaymentAttemptStatus.FAILED:
            payment_request.status = PaymentRequestStatus.FAILED
            payment_request.rejection_reason = result.failure_reason
            payment_request.updated_by = actor.id
            payment_request.save()
            audit_services.record_payment_failed(
                actor=actor,
                payment_request_id=payment_request.id,
                reason=result.failure_reason,
                metadata={"provider_reference": result.provider_reference},
            )

        elif result.status == PaymentAttemptStatus.AMBIGUOUS:
            payment_request.status = PaymentRequestStatus.PROCESSING
            payment_request.updated_by = actor.id
            payment_request.save()

        return attempt, payment_request


def reconcile_payment_attempt(
    *,
    payment_attempt_id: uuid.UUID,
    actor: UserAccount,
    provider: PaymentProvider | None = None,
) -> tuple[PaymentAttempt, PaymentRequest]:
    """Reconcile an AMBIGUOUS payment attempt against the authoritative gateway result.

    Only Finance Officers and Administrators may execute reconciliation.
    Resolves the attempt to SUCCESS or FAILED based on the provider query response.
    """
    if not getattr(actor, "is_active", False):
        raise PermissionDenied("Inactive users cannot reconcile payment attempts.")

    role = getattr(actor, "role", None)
    is_finance = getattr(actor, "is_superuser", False) or role in (
        UserRole.FINANCE_OFFICER,
        UserRole.ADMINISTRATOR,
    )
    if not is_finance:
        raise PermissionDenied(
            "Only Finance Officers and Administrators can reconcile payments."
        )

    payment_provider = provider or get_payment_provider()

    with transaction.atomic():
        attempt = (
            PaymentAttempt.objects.select_for_update()
            .filter(id=payment_attempt_id)
            .first()
        )
        if attempt is None:
            raise ValidationError({"payment_attempt": "Payment attempt not found."})

        if attempt.status != PaymentAttemptStatus.AMBIGUOUS:
            raise ValidationError(
                {
                    "status": (
                        "Only AMBIGUOUS attempts can be reconciled; current "
                        f"status is '{attempt.status}'."
                    )
                }
            )

        payment_request = (
            PaymentRequest.objects.select_for_update()
            .filter(id=attempt.payment_request_id)
            .first()
        )
        if payment_request is None:
            raise ValidationError({"payment_request": "Payment request not found."})

        result = payment_provider.query_payment_status(
            provider_reference=attempt.provider_reference,
            idempotency_key=attempt.idempotency_key,
        )

        if result.status == PaymentAttemptStatus.SUCCESS:
            attempt.status = PaymentAttemptStatus.SUCCESS
            attempt.metadata.update(result.metadata)
            attempt.updated_by = actor.id
            attempt.save()

            payment_request.status = PaymentRequestStatus.PAID
            payment_request.updated_by = actor.id
            payment_request.save()

            audit_services.record_payment_completed(
                actor=actor,
                payment_request_id=payment_request.id,
                metadata={
                    "provider_reference": result.provider_reference,
                    "reconciliation": True,
                },
            )

        elif result.status == PaymentAttemptStatus.FAILED:
            attempt.status = PaymentAttemptStatus.FAILED
            attempt.failure_reason = result.failure_reason
            attempt.updated_by = actor.id
            attempt.save()

            payment_request.status = PaymentRequestStatus.FAILED
            payment_request.rejection_reason = result.failure_reason
            payment_request.updated_by = actor.id
            payment_request.save()

            audit_services.record_payment_failed(
                actor=actor,
                payment_request_id=payment_request.id,
                reason=result.failure_reason,
                metadata={
                    "provider_reference": result.provider_reference,
                    "reconciliation": True,
                },
            )

        return attempt, payment_request


def parse_datetime_boundary(
    value: str | datetime | date | None,
    *,
    is_end_of_day: bool = False,
    tz: tzinfo | None = None,
) -> datetime | None:
    """Parse a date or ISO datetime string into a timezone-aware datetime."""
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

    if len(str_val) == 10 and str_val.count("-") == 2:
        try:
            parsed_date = date.fromisoformat(str_val)
            boundary_time = time(23, 59, 59, 999999) if is_end_of_day else time.min
            combined = datetime.combine(parsed_date, boundary_time)
            return timezone.make_aware(combined, active_tz)
        except ValueError:
            pass

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
    """
    if queryset is None:
        queryset = PaymentRequest.objects.select_related(
            "vendor", "project", "requester"
        ).all()

    if user is not None and not can_view_all_payments(user):
        user_id = getattr(user, "id", None)
        if user_id:
            queryset = queryset.filter(Q(requester=user) | Q(created_by=user_id))
        else:
            queryset = queryset.filter(requester=user)

    if vendor_id:
        if isinstance(vendor_id, str):
            try:
                vendor_id = uuid.UUID(vendor_id.strip())
            except ValueError as exc:
                raise ValueError("Invalid vendor_id UUID format.") from exc
        queryset = queryset.filter(vendor_id=vendor_id)

    if vendor and str(vendor).strip():
        vendor_str = str(vendor).strip()
        try:
            vendor_uuid = uuid.UUID(vendor_str)
            queryset = queryset.filter(vendor_id=vendor_uuid)
        except ValueError:
            queryset = queryset.filter(vendor__name__icontains=vendor_str)

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

    if requester_id:
        if isinstance(requester_id, str):
            try:
                requester_id = uuid.UUID(requester_id.strip())
            except ValueError as exc:
                raise ValueError("Invalid requester_id UUID format.") from exc
        queryset = queryset.filter(requester_id=requester_id)

    if requester and str(requester).strip():
        req_pattern = str(requester).strip()
        try:
            req_uuid = uuid.UUID(req_pattern)
            queryset = queryset.filter(requester_id=req_uuid)
        except ValueError:
            queryset = queryset.filter(
                Q(requester__username__icontains=req_pattern)
                | Q(requester__first_name__icontains=req_pattern)
                | Q(requester__last_name__icontains=req_pattern)
                | Q(requester__email__icontains=req_pattern)
            )

    if project_id:
        if isinstance(project_id, str):
            try:
                project_id = uuid.UUID(project_id.strip())
            except ValueError as exc:
                raise ValueError("Invalid project_id UUID format.") from exc
        queryset = queryset.filter(project_id=project_id)

    if project and str(project).strip():
        proj_pattern = str(project).strip()
        try:
            proj_uuid = uuid.UUID(proj_pattern)
            queryset = queryset.filter(project_id=proj_uuid)
        except ValueError:
            queryset = queryset.filter(
                Q(project__name__icontains=proj_pattern)
                | Q(project__code__iexact=proj_pattern)
            )

    if date_from:
        start_boundary = parse_datetime_boundary(date_from, is_end_of_day=False)
        if start_boundary:
            queryset = queryset.filter(created_at__gte=start_boundary)

    if date_to:
        end_boundary = parse_datetime_boundary(date_to, is_end_of_day=True)
        if end_boundary:
            queryset = queryset.filter(created_at__lte=end_boundary)

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
