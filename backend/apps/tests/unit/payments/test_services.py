"""Unit tests for payment request search and filtering services."""

from __future__ import annotations

from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import UserAccount, UserRole
from apps.payments.models import (
    PaymentMethod,
    PaymentRequest,
    PaymentRequestStatus,
)
from apps.payments.services import (
    filter_payment_requests,
    parse_datetime_boundary,
)
from apps.vendors.models import Project, Vendor


class ParseDatetimeBoundaryUnitTests(TestCase):
    """Unit tests for parse_datetime_boundary utility."""

    def test_parse_none_or_empty(self) -> None:
        """Returns None for None, empty, or whitespace-only inputs."""
        self.assertIsNone(parse_datetime_boundary(None))
        self.assertIsNone(parse_datetime_boundary(""))
        self.assertIsNone(parse_datetime_boundary("   "))

    def test_parse_calendar_date_start_and_end_of_day(self) -> None:
        """Correctly converts YYYY-MM-DD to start-of-day and end-of-day datetimes."""
        start = parse_datetime_boundary("2026-10-15", is_end_of_day=False)
        self.assertIsNotNone(start)
        self.assertTrue(timezone.is_aware(start))
        self.assertEqual(start.date(), date(2026, 10, 15))
        self.assertEqual(start.time(), time.min)

        end = parse_datetime_boundary("2026-10-15", is_end_of_day=True)
        self.assertIsNotNone(end)
        self.assertTrue(timezone.is_aware(end))
        self.assertEqual(end.date(), date(2026, 10, 15))
        self.assertEqual(end.time(), time(23, 59, 59, 999999))

    def test_parse_iso_string_with_time(self) -> None:
        """Parses ISO-8601 strings and ensures timezone awareness."""
        dt = parse_datetime_boundary("2026-10-15T14:30:00")
        self.assertIsNotNone(dt)
        self.assertTrue(timezone.is_aware(dt))
        self.assertEqual(dt.hour, 14)
        self.assertEqual(dt.minute, 30)

    def test_parse_date_and_datetime_objects(self) -> None:
        """Handles Python date and datetime instances gracefully."""
        d = date(2026, 10, 20)
        start = parse_datetime_boundary(d, is_end_of_day=False)
        self.assertIsNotNone(start)
        self.assertTrue(timezone.is_aware(start))
        self.assertEqual(start.date(), d)
        self.assertEqual(start.time(), time.min)

        naive_dt = datetime(2026, 10, 20, 10, 15)
        aware_dt = parse_datetime_boundary(naive_dt)
        self.assertIsNotNone(aware_dt)
        self.assertTrue(timezone.is_aware(aware_dt))

    def test_parse_invalid_string_raises_value_error(self) -> None:
        """Raises ValueError when input string is malformed."""
        with self.assertRaises(ValueError):
            parse_datetime_boundary("not-a-date")


class FilterPaymentRequestsServiceTests(TestCase):
    """Unit tests for filter_payment_requests composable query logic."""

    def setUp(self) -> None:
        self.finance_user = UserAccount.objects.create_user(
            username="finance_steve",
            email="finance_steve@example.com",
            role=UserRole.FINANCE_OFFICER,
        )
        self.employee1 = UserAccount.objects.create_user(
            username="employee_alice",
            email="alice@example.com",
            first_name="Alice",
            last_name="Mwangi",
            role=UserRole.EMPLOYEE,
        )
        self.employee2 = UserAccount.objects.create_user(
            username="employee_brian",
            email="brian@example.com",
            first_name="Brian",
            last_name="Otieno",
            role=UserRole.EMPLOYEE,
        )

        self.vendor1 = Vendor.objects.create(
            name="Safari Tech Ltd",
            email="safari@example.com",
            payment_details={"kra_pin": "P051234567Z", "bank": "0110901234567"},
        )
        self.vendor2 = Vendor.objects.create(
            name="Apex Office Supplies",
            email="apex@example.com",
            payment_details={"kra_pin": "P059876543A", "bank": "0110909876543"},
        )

        self.project1 = Project.objects.create(
            name="Core Banking Infrastructure",
            code="PRJ-CBI",
        )
        self.project2 = Project.objects.create(
            name="Field Logistics Operations",
            code="PRJ-FLO",
        )

        # Baseline requests
        self.req1 = PaymentRequest.objects.create(
            vendor=self.vendor1,
            project=self.project1,
            requester=self.employee1,
            created_by=self.employee1.id,
            amount=Decimal("45000.00"),
            currency="KES",
            invoice_number="INV-SAF-001",
            description="Quarterly server licensing",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.PENDING_APPROVAL,
        )
        self.req2 = PaymentRequest.objects.create(
            vendor=self.vendor2,
            project=self.project2,
            requester=self.employee2,
            created_by=self.employee2.id,
            amount=Decimal("15000.00"),
            currency="KES",
            invoice_number="INV-APX-001",
            description="Office stationery and paper reams",
            payment_method=PaymentMethod.MPESA,
            status=PaymentRequestStatus.APPROVED,
        )
        self.req3 = PaymentRequest.objects.create(
            vendor=self.vendor1,
            project=self.project2,
            requester=self.employee1,
            created_by=self.employee1.id,
            amount=Decimal("120000.00"),
            currency="KES",
            invoice_number="INV-SAF-002",
            description="Satellite terminal equipment",
            payment_method=PaymentMethod.BANK_TRANSFER,
            status=PaymentRequestStatus.PAID,
        )

    def test_filter_by_vendor_id_and_vendor_name(self) -> None:
        """Verifies filtering by exact vendor ID or partial vendor name."""
        qs = filter_payment_requests(user=self.finance_user, vendor_id=self.vendor1.id)
        self.assertEqual(qs.count(), 2)
        self.assertIn(self.req1, qs)
        self.assertIn(self.req3, qs)

        qs_name = filter_payment_requests(user=self.finance_user, vendor="Apex")
        self.assertEqual(qs_name.count(), 1)
        self.assertEqual(qs_name.first(), self.req2)

    def test_filter_by_status_single_and_comma_separated(self) -> None:
        """Filters by single status or multiple comma-separated statuses."""
        qs_paid = filter_payment_requests(
            user=self.finance_user, status=PaymentRequestStatus.PAID
        )
        self.assertEqual(qs_paid.count(), 1)
        self.assertEqual(qs_paid.first(), self.req3)

        qs_multi = filter_payment_requests(
            user=self.finance_user, status="PENDING_APPROVAL, APPROVED"
        )
        self.assertEqual(qs_multi.count(), 2)
        self.assertIn(self.req1, qs_multi)
        self.assertIn(self.req2, qs_multi)

    def test_filter_by_requester_id_and_username(self) -> None:
        """Filters requests by requester UUID or substring username/name."""
        qs_id = filter_payment_requests(
            user=self.finance_user, requester_id=self.employee1.id
        )
        self.assertEqual(qs_id.count(), 2)

        qs_user = filter_payment_requests(user=self.finance_user, requester="alice")
        self.assertEqual(qs_user.count(), 2)

    def test_filter_by_project_id_and_code(self) -> None:
        """Filters requests by project UUID, project name, or code."""
        qs_proj = filter_payment_requests(
            user=self.finance_user, project_id=self.project1.id
        )
        self.assertEqual(qs_proj.count(), 1)
        self.assertEqual(qs_proj.first(), self.req1)

        qs_code = filter_payment_requests(user=self.finance_user, project="PRJ-FLO")
        self.assertEqual(qs_code.count(), 2)

    def test_filter_by_payment_method(self) -> None:
        """Filters by payment method enum value."""
        qs_mpesa = filter_payment_requests(
            user=self.finance_user, payment_method=PaymentMethod.MPESA
        )
        self.assertEqual(qs_mpesa.count(), 1)
        self.assertEqual(qs_mpesa.first(), self.req2)

    def test_filter_by_amount_range(self) -> None:
        """Filters requests constrained by min_amount and max_amount."""
        qs_min = filter_payment_requests(user=self.finance_user, min_amount="50000.00")
        self.assertEqual(qs_min.count(), 1)
        self.assertEqual(qs_min.first(), self.req3)

        qs_range = filter_payment_requests(
            user=self.finance_user,
            min_amount="10000.00",
            max_amount="50000.00",
        )
        self.assertEqual(qs_range.count(), 2)
        self.assertIn(self.req1, qs_range)
        self.assertIn(self.req2, qs_range)

    def test_filter_by_free_text_search(self) -> None:
        """Performs search across invoice number, description, and vendor."""
        qs_inv = filter_payment_requests(
            user=self.finance_user, search_query="INV-SAF-002"
        )
        self.assertEqual(qs_inv.count(), 1)
        self.assertEqual(qs_inv.first(), self.req3)

        qs_desc = filter_payment_requests(
            user=self.finance_user, search_query="stationery"
        )
        self.assertEqual(qs_desc.count(), 1)
        self.assertEqual(qs_desc.first(), self.req2)

    def test_filter_by_deterministic_date_range(self) -> None:
        """Verifies deterministic timezone-aware date range filtering."""
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)

        qs_today = filter_payment_requests(
            user=self.finance_user,
            date_from=str(yesterday),
            date_to=str(today),
        )
        self.assertEqual(qs_today.count(), 3)

        qs_future = filter_payment_requests(
            user=self.finance_user,
            date_from=str(tomorrow),
        )
        self.assertEqual(qs_future.count(), 0)

    def test_role_based_scoping_for_employees(self) -> None:
        """Employees are strictly restricted to their own requests."""
        qs_alice = filter_payment_requests(user=self.employee1)
        self.assertEqual(qs_alice.count(), 2)
        self.assertNotIn(self.req2, qs_alice)

        qs_brian = filter_payment_requests(user=self.employee2)
        self.assertEqual(qs_brian.count(), 1)
        self.assertEqual(qs_brian.first(), self.req2)

    def test_composable_filter_combination(self) -> None:
        """Combines vendor, status, project, and amount filters simultaneously."""
        qs = filter_payment_requests(
            user=self.finance_user,
            vendor="Safari",
            status="PENDING_APPROVAL",
            project="PRJ-CBI",
            min_amount="40000",
            max_amount="50000",
        )
        self.assertEqual(qs.count(), 1)
        self.assertEqual(qs.first(), self.req1)

    def test_invalid_uuid_and_decimal_raise_value_error(self) -> None:
        """Raises ValueError on malformed UUIDs or decimal amounts."""
        with self.assertRaises(ValueError):
            filter_payment_requests(
                user=self.finance_user, vendor_id="not-a-valid-uuid"
            )

        with self.assertRaises(ValueError):
            filter_payment_requests(
                user=self.finance_user, requester_id="invalid-requester-uuid"
            )

        with self.assertRaises(ValueError):
            filter_payment_requests(
                user=self.finance_user, project_id="invalid-project-uuid"
            )

        with self.assertRaises(ValueError):
            filter_payment_requests(
                user=self.finance_user, min_amount="invalid-decimal"
            )

        with self.assertRaises(ValueError):
            filter_payment_requests(
                user=self.finance_user, max_amount="invalid-decimal"
            )

    def test_list_parameters_for_status_and_payment_methods(self) -> None:
        """Filters with list inputs for status and payment methods."""
        qs_status = filter_payment_requests(
            user=self.finance_user,
            status=[PaymentRequestStatus.PAID, PaymentRequestStatus.APPROVED],
        )
        self.assertEqual(qs_status.count(), 2)

        qs_methods = filter_payment_requests(
            user=self.finance_user,
            payment_method=[PaymentMethod.MPESA, PaymentMethod.BANK_TRANSFER],
        )
        self.assertEqual(qs_methods.count(), 3)
