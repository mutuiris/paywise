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
        hint="Dual-tier clearance (>50k)"
      />
      <SummaryCard
        label="Total Pending Value"
        value={formatCurrency(totalPendingAmount)}
        tone="brand"
        hint="Reserved in budget"
      />
      <SummaryCard
        label="Policy Threshold"
        value="KES 50,000"
        tone="neutral"
        hint="Manager + Finance sign-off"
      />
      <SummaryCard
        label="Audit SLA"
        value="100%"
        tone="ok"
        hint="Zero self-approvals permitted"
      />
    </div>
  );
}
