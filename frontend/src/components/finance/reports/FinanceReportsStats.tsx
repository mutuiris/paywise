'use client';

import React from 'react';
import { SummaryCard } from '@/components/common/SummaryCard';

interface FinanceReportsStatsProps {
  totalDisbursed?: string;
  totalPaidCount?: number;
  totalRequests?: number;
  awaitingApprovalCount?: number;
}

export function FinanceReportsStats({
  totalDisbursed = 'KES 1,480,200',
  totalPaidCount = 14,
  totalRequests = 17,
  awaitingApprovalCount = 2,
}: FinanceReportsStatsProps = {}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-serif">
      <SummaryCard
        label="Total Disbursed"
        badge="Settled"
        value={totalDisbursed}
        hint={`${totalPaidCount} settled payouts`}
        tone="brand"
      />
      <SummaryCard
        label="Requests Tracked"
        value={String(totalRequests)}
        hint="Cumulative workflow requests"
        tone="neutral"
      />
      <SummaryCard
        label="Pending Approvals"
        value={String(awaitingApprovalCount)}
        hint="Awaiting clearance"
        tone="warn"
      />
      <SummaryCard
        label="Dual-Approval Compliance"
        value="100%"
        hint="Zero threshold bypasses"
        tone="ok"
      />
    </div>
  );
}
