import { useEffect, useState } from 'react';
import { PaymentAttempt } from './types';
import { paymentService, type PaymentAttemptDTO } from '@/lib/api/services';
import { ApiClientError } from '@/lib/api/client';

function toAttempt(a: PaymentAttemptDTO): PaymentAttempt | null {
  // PROCESSING attempts are still in flight and cannot be reconciled yet.
  if (a.status === 'PROCESSING') return null;
  return {
    id: a.id,
    reference: a.invoice_number || `PR-${a.payment_request_id.slice(0, 6).toUpperCase()}`,
    vendorName: a.vendor_name || 'Designated Vendor',
    amount: parseFloat(a.amount) || 0,
    status: a.status === 'SUCCESS' ? 'SUCCEEDED' : a.status,
    providerReference: a.provider_reference || undefined,
    startedAt: a.created_at || '',
    note: a.failure_reason || undefined,
  };
}

export function useReconciliation() {
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    let ignore = false;
    paymentService
      .listAttempts()
      .then((res) => {
        if (!ignore) setAttempts(res.results.map(toAttempt).filter((a) => a !== null));
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof ApiClientError ? err.message : 'Unable to reach the Paywise API.');
      });
    return () => {
      ignore = true;
    };
  }, []);

  const ambiguousCount = attempts.filter((a) => a.status === 'AMBIGUOUS').length;
  const succeededCount = attempts.filter((a) => a.status === 'SUCCEEDED').length;
  const failedCount = attempts.filter((a) => a.status === 'FAILED').length;

  const handleVerify = async (attemptId: string) => {
    setVerifyingId(attemptId);
    setError(null);
    try {
      const { payment_attempt } = await paymentService.reconcileAttempt(attemptId);
      const updated = toAttempt(payment_attempt);
      if (updated) setAttempts((prev) => prev.map((a) => (a.id === attemptId ? updated : a)));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Unable to reach the Paywise API.');
    } finally {
      setVerifyingId(null);
    }
  };

  const filtered = attempts.filter((item) => {
    const matchesSearch =
      item.reference.toLowerCase().includes(search.toLowerCase()) ||
      item.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    filtered,
    verifyingId,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    ambiguousCount,
    succeededCount,
    failedCount,
    handleVerify,
  };
}
