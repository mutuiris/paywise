'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SummaryCard } from '@/components/common/SummaryCard';

interface FinanceDashboardStatsProps {
  queueCount: number;
  failedCount: number;
  awaitingApprovalCount?: number;
  paidCount?: number;
  processingCount?: number;
}

export function FinanceDashboardStats({
  queueCount,
  failedCount,
  awaitingApprovalCount = 2,
  paidCount = 14,
  processingCount = 1,
}: FinanceDashboardStatsProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <SummaryCard
        label="Awaiting Finance Approval"
        value={awaitingApprovalCount}
        tone="warn"
        onClick={() => router.push('/finance/approvals')}
      />
      <SummaryCard
        label="Ready for Processing"
        value={queueCount}
        tone="brand"
        onClick={() => router.push('/finance/payments')}
      />
      <SummaryCard
        label="Processing"
        value={processingCount}
        tone="warn"
        hint="Includes unconfirmed"
        onClick={() => router.push('/finance/reconciliation')}
      />
      <SummaryCard
        label="Paid"
        value={paidCount}
        tone="ok"
        onClick={() => router.push('/finance/requests')}
      />
      <SummaryCard
        label="Failed"
        value={failedCount}
        tone="err"
        onClick={() => router.push('/finance/payments')}
      />
    </div>
  );
}
