import { useState } from 'react';
import { PaymentAttempt } from './types';
import { INITIAL_ATTEMPTS } from './mockData';

export function useReconciliation() {
  const [attempts, setAttempts] = useState<PaymentAttempt[]>(INITIAL_ATTEMPTS);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const ambiguousCount = attempts.filter((a) => a.status === 'AMBIGUOUS').length;
  const succeededCount = attempts.filter((a) => a.status === 'SUCCEEDED').length;
  const failedCount = attempts.filter((a) => a.status === 'FAILED').length;

  const handleVerify = (attemptId: string) => {
    setVerifyingId(attemptId);
    setTimeout(() => {
      setAttempts((prev) =>
        prev.map((a) =>
          a.id === attemptId
            ? { ...a, status: 'SUCCEEDED', providerReference: 'PAY-89244-REC', note: 'Reconciled: Confirmed completed on provider ledger.' }
            : a
        )
      );
      setVerifyingId(null);
    }, 1200);
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
