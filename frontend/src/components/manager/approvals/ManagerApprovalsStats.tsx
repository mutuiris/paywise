'use client';

import React from 'react';
import { SummaryCard } from '@/components/common/SummaryCard';
import { formatCurrency } from '@/data/mock-manager-data';

interface ManagerApprovalsStatsProps {
  pendingCount: number;
  pendingAmount: number;
  dualCount: number;
}

export function ManagerApprovalsStats({
  pendingCount,
  pendingAmount,
  dualCount,
}: ManagerApprovalsStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 font-serif">
      <SummaryCard
        label="Pending Approval"
        value={pendingCount}
        tone="warn"
        hint="Needs your authorization"
      />
      <SummaryCard
        label="Pending Value"
        value={formatCurrency(pendingAmount)}
        tone="brand"
        hint="Requisitions in queue"
      />
      <SummaryCard
        label="Dual-Approval Route"
        value={dualCount}
        tone="brand"
        hint="> KES 50k requires Finance"
      />
      <SummaryCard
        label="Approval SLA"
        value="4.2 hrs"
        tone="ok"
        hint="Within company policy"
      />
    </div>
  );
}
