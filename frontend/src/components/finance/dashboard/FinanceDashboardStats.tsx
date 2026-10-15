'use client';

import React from 'react';
import { SummaryCard } from '@/components/common/SummaryCard';

interface FinanceDashboardStatsProps {
  queueCount: number;
  failedCount: number;
}

export function FinanceDashboardStats({
  queueCount,
  failedCount,
}: FinanceDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <SummaryCard
        label="Awaiting Finance Approval"
        value="2"
        tone="warn"
      />
      <SummaryCard
        label="Ready for Processing"
        value={queueCount}
        tone="brand"
      />
      <SummaryCard
        label="Processing"
        value="1"
        tone="warn"
        hint="Includes unconfirmed"
      />
      <SummaryCard
        label="Paid"
        value="14"
        tone="ok"
      />
      <SummaryCard
        label="Failed"
        value={failedCount}
        tone="err"
      />
    </div>
  );
}
