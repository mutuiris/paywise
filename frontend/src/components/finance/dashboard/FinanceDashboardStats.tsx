'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SummaryCard } from '@/components/common/SummaryCard';

interface FinanceDashboardStatsProps {
  queueCount: number;
  failedCount: number;
}

export function FinanceDashboardStats({
  queueCount,
  failedCount,
}: FinanceDashboardStatsProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <SummaryCard
        label="Awaiting Finance Approval"
        value="2"
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
        value="1"
        tone="warn"
        hint="Includes unconfirmed"
        onClick={() => router.push('/finance/reconciliation')}
      />
      <SummaryCard
        label="Paid"
        value="14"
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
