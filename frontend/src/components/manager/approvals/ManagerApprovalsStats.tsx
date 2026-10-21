'use client';

import React from 'react';
import { SummaryCard } from '@/components/common/SummaryCard';

interface ManagerApprovalsStatsProps {
  pendingCount: number;
  /** Pre-formatted exact total, for example "KES 109,500". */
  pendingAmount: string;
  dualCount: number;
  /** Age of the oldest request still waiting for a decision. */
  oldestAge: string;
}

export function ManagerApprovalsStats({
  pendingCount,
  pendingAmount,
  dualCount,
  oldestAge,
}: ManagerApprovalsStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 font-serif">
      <SummaryCard
        label="Awaiting My Approval"
        value={pendingCount}
        tone="warn"
        hint="Needs your authorization"
      />
      <SummaryCard
        label="Pending Value"
        value={pendingAmount}
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
        label="Oldest In Queue"
        value={oldestAge}
        tone="ok"
        hint="Waiting the longest"
      />
    </div>
  );
}
