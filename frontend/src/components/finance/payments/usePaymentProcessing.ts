import { useState, useEffect, useCallback } from 'react';
import { PaymentItem } from './types';
import { paymentService, reportingService } from '@/lib/api/services';
import { ApiClientError } from '@/lib/api/client';

const ACCOUNT_DETAILS = 'Vendor payout details on file';

function cleanFailureReason(reason?: string | null): string {
  if (!reason) return '';
  return reason.replace(/^simulated gateway error:\s*/i, '').trim();
}

function toPaymentMethod(method: string | undefined): PaymentItem['paymentMethod'] {
  return method === 'BANK' || method === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'MPESA';
}

async function loadPayments(): Promise<PaymentItem[]> {
  const [approvedRes, failedRes] = await Promise.allSettled([
    paymentService.listRequests({ status: 'APPROVED' }),
    reportingService.getFailedPayments(),
  ]);
  const items: PaymentItem[] = [];

  if (approvedRes.status === 'fulfilled') {
    approvedRes.value.results?.forEach((r) => {
      items.push({
        id: r.id,
        reference: r.invoice_number || `PR-${r.id.slice(0, 6).toUpperCase()}`,
        vendorName: r.vendor_name || 'Designated Vendor',
        amount: parseFloat(r.amount) || 0,
        invoiceNumber: r.invoice_number || `INV-${r.id.slice(0, 6).toUpperCase()}`,
        paymentMethod: toPaymentMethod(r.payment_method),
        accountDetails: ACCOUNT_DETAILS,
        status: 'READY',
      });
    });
  }

  if (failedRes.status === 'fulfilled') {
    failedRes.value?.results?.forEach((f) => {
      items.push({
        id: f.id,
        reference: f.invoice_number,
        vendorName: f.vendor_name || 'Designated Vendor',
        amount: parseFloat(f.amount) || 0,
        invoiceNumber: f.invoice_number,
        paymentMethod: toPaymentMethod(f.payment_method),
        accountDetails: ACCOUNT_DETAILS,
        status: 'FAILED',
        failureReason: cleanFailureReason(f.failure_reason),
      });
    });
  }

  return items;
}

export function usePaymentProcessing() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [activeItem, setActiveItem] = useState<PaymentItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    loadPayments().then(setPayments);
  }, []);

  useEffect(() => {
    let ignore = false;
    loadPayments().then((items) => {
      if (!ignore) setPayments(items);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const readyItems = payments.filter((p) => p.status === 'READY');
  const failedItems = payments.filter((p) => p.status === 'FAILED');

  const handleExecute = async (item: PaymentItem) => {
    setActiveItem(item);
    setIsProcessing(true);
    setSuccessRef(null);
    setError(null);
    try {
      // A fresh key per click; the backend dedupes replays of the same key.
      const { payment_attempt: attempt } = await paymentService.processRequest(
        item.id,
        crypto.randomUUID()
      );
      if (attempt.status === 'SUCCESS') {
        setSuccessRef(attempt.provider_reference);
        setPayments((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: 'PAID' } : p)));
        return;
      }
      setActiveItem(null);
      setError(
        attempt.status === 'AMBIGUOUS'
          ? `${item.reference}: provider did not confirm (${cleanFailureReason(attempt.failure_reason)}). Resolve it on the Reconciliation page.`
          : `${item.reference} failed: ${cleanFailureReason(attempt.failure_reason) || 'provider declined the payment.'}`
      );
      refreshData();
    } catch (err) {
      setActiveItem(null);
      setError(err instanceof ApiClientError ? err.message : 'Unable to reach the Paywise API.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = (item: PaymentItem) => {
    handleExecute(item);
  };

  return {
    readyItems,
    failedItems,
    activeItem,
    isProcessing,
    successRef,
    error,
    handleExecute,
    handleRetry,
    refreshData,
    closeModal: () => setActiveItem(null),
  };
}
