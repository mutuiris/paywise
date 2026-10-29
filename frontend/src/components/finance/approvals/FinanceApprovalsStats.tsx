'use client';

import React from 'react';
import { SummaryCard } from '@/components/common/SummaryCard';
import { formatCurrency } from '@/data/mock-manager-data';

interface FinanceApprovalsStatsProps {
  pendingCount: number;
  totalPendingAmount: number;
}

export function FinanceApprovalsStats({
  pendingCount,
  totalPendingAmount,
}: FinanceApprovalsStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 font-serif">
      <SummaryCard
        label="Awaiting Approval"
        value={pendingCount}
        tone="warn"
      />
      <SummaryCard
        label="Total Pending Value"
        value={formatCurrency(totalPendingAmount)}
        tone="brand"
      />
      <SummaryCard
        label="Policy Threshold"
        value="KES 50,000"
        tone="neutral"
      />
      <SummaryCard
        label="Audit"
        value="100%"
        tone="ok"
      />
    </div>
  );
}
