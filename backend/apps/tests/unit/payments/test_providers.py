"""Unit tests for payment provider interface and mock provider implementation."""

from __future__ import annotations

import uuid
from decimal import Decimal

from django.test import TestCase

from apps.payments.models import PaymentAttemptStatus
from apps.payments.providers import (
    MockPaymentProvider,
    get_payment_provider,
)


class PaymentProviderTestCase(TestCase):
    def setUp(self) -> None:
        self.provider = MockPaymentProvider()
        self.payment_id = uuid.uuid4()
        self.destination = {"paybill": "123456", "account": "ACC01"}

    def test_mock_provider_success_normal_amount(self) -> None:
        result = self.provider.process_payment(
            payment_request_id=self.payment_id,
            amount=Decimal("45000.00"),
            currency="KES",
            payment_method="MPESA",
            destination_details=self.destination,
            idempotency_key="idemp-key-normal-1",
        )
        self.assertEqual(result.status, PaymentAttemptStatus.SUCCESS)
        self.assertTrue(result.provider_reference.startswith("MPESA-MOCK-"))
        self.assertEqual(result.failure_reason, "")
        self.assertIn("receipt", result.metadata)

    def test_mock_provider_deterministic_reference(self) -> None:
        key = "idemp-key-consistent-ref"
        res1 = self.provider.process_payment(
            payment_request_id=self.payment_id,
            amount=Decimal("1000.00"),
            currency="KES",
            payment_method="MPESA",
            destination_details=self.destination,
            idempotency_key=key,
        )
        res2 = self.provider.process_payment(
            payment_request_id=self.payment_id,
            amount=Decimal("1000.00"),
            currency="KES",
            payment_method="MPESA",
            destination_details=self.destination,
            idempotency_key=key,
        )
        self.assertEqual(res1.provider_reference, res2.provider_reference)

    def test_mock_provider_cents_99_triggers_failure(self) -> None:
        result = self.provider.process_payment(
            payment_request_id=self.payment_id,
            amount=Decimal("25000.99"),
            currency="KES",
            payment_method="MPESA",
            destination_details=self.destination,
            idempotency_key="idemp-key-failure-99",
        )
        self.assertEqual(result.status, PaymentAttemptStatus.FAILED)
        self.assertIn("Simulated gateway error", result.failure_reason)

    def test_mock_provider_cents_88_triggers_ambiguous_timeout(self) -> None:
        result = self.provider.process_payment(
            payment_request_id=self.payment_id,
            amount=Decimal("15000.88"),
            currency="KES",
            payment_method="MPESA",
            destination_details=self.destination,
            idempotency_key="idemp-key-ambiguous-88",
        )
        self.assertEqual(result.status, PaymentAttemptStatus.AMBIGUOUS)
        self.assertIn("Simulated gateway timeout", result.failure_reason)

    def test_mock_provider_forced_modes(self) -> None:
        fail_provider = MockPaymentProvider(mode="FORCE_FAILED")
        res_fail = fail_provider.process_payment(
            payment_request_id=self.payment_id,
            amount=Decimal("1000.00"),
            currency="KES",
            payment_method="MPESA",
            destination_details=self.destination,
            idempotency_key="key-fail-mode",
        )
        self.assertEqual(res_fail.status, PaymentAttemptStatus.FAILED)

        ambig_provider = MockPaymentProvider(mode="FORCE_AMBIGUOUS")
        res_ambig = ambig_provider.process_payment(
            payment_request_id=self.payment_id,
            amount=Decimal("1000.00"),
            currency="KES",
            payment_method="MPESA",
            destination_details=self.destination,
            idempotency_key="key-ambig-mode",
        )
        self.assertEqual(res_ambig.status, PaymentAttemptStatus.AMBIGUOUS)

        succ_provider = MockPaymentProvider(mode="FORCE_SUCCESS")
        res_succ = succ_provider.process_payment(
            payment_request_id=self.payment_id,
            amount=Decimal("1000.99"),  # even with .99, forced mode wins
            currency="KES",
            payment_method="MPESA",
            destination_details=self.destination,
            idempotency_key="key-succ-mode",
        )
        self.assertEqual(res_succ.status, PaymentAttemptStatus.SUCCESS)

    def test_mock_provider_reconciliation_query(self) -> None:
        result = self.provider.query_payment_status(
            provider_reference="MPESA-MOCK-ABC12345",
            idempotency_key="idemp-key-reconcile",
        )
        self.assertEqual(result.status, PaymentAttemptStatus.SUCCESS)
        self.assertTrue(result.metadata.get("reconciled"))

        forced_fail_query = MockPaymentProvider(reconciliation_mode="FORCE_FAILED")
        res_fail = forced_fail_query.query_payment_status(
            provider_reference="MPESA-MOCK-ABC12345",
            idempotency_key="idemp-key-reconcile-fail",
        )
        self.assertEqual(res_fail.status, PaymentAttemptStatus.FAILED)

    def test_get_payment_provider_factory(self) -> None:
        provider = get_payment_provider()
        self.assertIsInstance(provider, MockPaymentProvider)
