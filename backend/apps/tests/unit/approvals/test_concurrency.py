import threading
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import connection
from django.test import TransactionTestCase

from apps.accounts.models import UserAccount, UserRole
from apps.approvals.models import Approval, ApprovalDecision, ApprovalTier
from apps.approvals.services import (
    get_pending_tiers,
    get_required_tiers,
    is_fully_approved,
    record_approval,
    update_payment_request_amount,
)
from apps.payments.models import PaymentRequest, PaymentRequestStatus
from apps.vendors.models import Vendor


class ApprovalConcurrencyUnitTestCase(TransactionTestCase):
    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="conc_emp",
            role=UserRole.EMPLOYEE,
        )
        self.manager1 = UserAccount.objects.create_user(
            username="conc_mgr1",
            role=UserRole.MANAGER,
        )
        self.manager2 = UserAccount.objects.create_user(
            username="conc_mgr2",
            role=UserRole.MANAGER,
        )
        self.finance = UserAccount.objects.create_user(
            username="conc_fin",
            role=UserRole.FINANCE_OFFICER,
        )
        self.vendor = Vendor.objects.create(name="Vendor Concurrency Test")

    def test_duplicate_approval_attempt_by_same_approver_rejected(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("30000.00"),
            invoice_number="INV-CONC-01",
            description="Office chairs",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        record_approval(
            payment_request=req,
            approver=self.manager1,
            decision=ApprovalDecision.APPROVED,
        )

        with self.assertRaises(ValidationError):
            record_approval(
                payment_request=req,
                approver=self.manager1,
                decision=ApprovalDecision.APPROVED,
            )

    def test_second_manager_approval_rejected_when_tier_already_approved(
        self,
    ) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("30000.00"),
            invoice_number="INV-CONC-02",
            description="Office desks",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        record_approval(
            payment_request=req,
            approver=self.manager1,
            decision=ApprovalDecision.APPROVED,
        )

        # Manager 2 attempts to approve the same manager tier
        with self.assertRaises(ValidationError):
            record_approval(
                payment_request=req,
                approver=self.manager2,
                tier=ApprovalTier.MANAGER,
                decision=ApprovalDecision.APPROVED,
            )

    def test_illegal_decisions_after_rejection_are_rejected(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("20000.00"),
            invoice_number="INV-CONC-03",
            description="Office supplies",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        record_approval(
            payment_request=req,
            approver=self.manager1,
            decision=ApprovalDecision.REJECTED,
            reason="Unapproved expenditure category.",
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.REJECTED)

        # Subsequent approval attempt must be rejected
        with self.assertRaises(ValidationError):
            record_approval(
                payment_request=req,
                approver=self.manager2,
                decision=ApprovalDecision.APPROVED,
            )

        # Subsequent rejection attempt must also be rejected
        with self.assertRaises(ValidationError):
            record_approval(
                payment_request=req,
                approver=self.manager2,
                decision=ApprovalDecision.REJECTED,
                reason="Duplicate rejection attempt.",
            )

    def test_illegal_decisions_after_full_approval_are_rejected(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("15000.00"),
            invoice_number="INV-CONC-04",
            description="Software licenses",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        record_approval(
            payment_request=req,
            approver=self.manager1,
            decision=ApprovalDecision.APPROVED,
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)

        # Attempting to approve an already approved request
        with self.assertRaises(ValidationError):
            record_approval(
                payment_request=req,
                approver=self.manager2,
                decision=ApprovalDecision.APPROVED,
            )

        # Attempting to reject an already approved request
        with self.assertRaises(ValidationError):
            record_approval(
                payment_request=req,
                approver=self.manager2,
                decision=ApprovalDecision.REJECTED,
                reason="Late rejection after approval.",
            )

    def test_amount_change_invalidates_prior_approvals_and_resets_status(
        self,
    ) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("40000.00"),
            invoice_number="INV-CONC-05",
            description="Catering services",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        record_approval(
            payment_request=req,
            approver=self.manager1,
            decision=ApprovalDecision.APPROVED,
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)
        self.assertTrue(is_fully_approved(req))

        # Material amount change via service
        updated = update_payment_request_amount(
            payment_request=req,
            new_amount=Decimal("45000.00"),
            actor=self.employee,
        )
        self.assertEqual(updated.amount, Decimal("45000.00"))
        self.assertEqual(updated.status, PaymentRequestStatus.PENDING_APPROVAL)
        self.assertFalse(is_fully_approved(updated))

        # Prior approval marked inactive
        active_approvals = Approval.objects.filter(
            payment_request=updated, is_active=True
        )
        self.assertEqual(active_approvals.count(), 0)

        # Manager can now re-approve the revised amount
        record_approval(
            payment_request=updated,
            approver=self.manager1,
            decision=ApprovalDecision.APPROVED,
        )
        updated.refresh_from_db()
        self.assertEqual(updated.status, PaymentRequestStatus.APPROVED)

    def test_amount_change_crossing_threshold_requires_finance_approval(
        self,
    ) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("30000.00"),
            invoice_number="INV-CONC-06",
            description="Equipment rental",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )
        record_approval(
            payment_request=req,
            approver=self.manager1,
            decision=ApprovalDecision.APPROVED,
        )
        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)

        # Increase amount above KES 50,000 threshold
        updated = update_payment_request_amount(
            payment_request=req,
            new_amount=Decimal("85000.00"),
            actor=self.employee,
        )
        self.assertEqual(updated.status, PaymentRequestStatus.PENDING_APPROVAL)
        self.assertEqual(
            get_required_tiers(updated),
            [ApprovalTier.MANAGER, ApprovalTier.FINANCE],
        )
        self.assertEqual(
            get_pending_tiers(updated),
            [ApprovalTier.MANAGER, ApprovalTier.FINANCE],
        )

    def test_cannot_alter_amount_when_processing_or_paid(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("25000.00"),
            invoice_number="INV-CONC-07",
            description="Printing paper",
            status=PaymentRequestStatus.PROCESSING,
            created_by=self.employee.id,
        )
        with self.assertRaises(ValidationError):
            update_payment_request_amount(
                payment_request=req,
                new_amount=Decimal("30000.00"),
                actor=self.employee,
            )

    def test_concurrent_multithreaded_approvals_safeguard(self) -> None:
        req = PaymentRequest.objects.create(
            vendor=self.vendor,
            requester=self.employee,
            amount=Decimal("35000.00"),
            invoice_number="INV-CONC-RACE",
            description="Racing approvals test",
            status=PaymentRequestStatus.PENDING_APPROVAL,
            created_by=self.employee.id,
        )

        results: list[str] = []
        errors: list[Exception] = []

        def approve_worker(approver: UserAccount) -> None:
            connection.close()
            try:
                record_approval(
                    payment_request=req,
                    approver=approver,
                    decision=ApprovalDecision.APPROVED,
                )
                results.append("success")
            except Exception as exc:
                errors.append(exc)
            finally:
                connection.close()

        t1 = threading.Thread(target=approve_worker, args=(self.manager1,))
        t2 = threading.Thread(target=approve_worker, args=(self.manager2,))

        t1.start()
        t2.start()
        t1.join()
        t2.join()

        # Exactly 1 thread must succeed; the other must receive
        # ValidationError or lock OperationalError
        self.assertEqual(len(results), 1)
        self.assertEqual(len(errors), 1)
        from django.db import OperationalError

        self.assertTrue(isinstance(errors[0], (ValidationError, OperationalError)))

        req.refresh_from_db()
        self.assertEqual(req.status, PaymentRequestStatus.APPROVED)
        active_approvals = Approval.objects.filter(payment_request=req, is_active=True)
        self.assertEqual(active_approvals.count(), 1)
