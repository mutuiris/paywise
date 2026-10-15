'use client';

import React from 'react';
import { SummaryCard } from '@/components/common/SummaryCard';

export function ManagerReportsStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Total Approved Volume"
        badge="MTD"
        value="KES 1,240,000"
        hint="+12% vs last month"
        tone="brand"
      />
      <SummaryCard
        label="Avg. Approval Turnaround"
        value="4.2 hrs"
        hint="18% faster than policy SLA"
        tone="ok"
      />
      <SummaryCard
        label="Secondary Sign-offs"
        badge=">50k"
        value="14"
        hint="Routed to Finance for clearance"
        tone="neutral"
      />
      <SummaryCard
        label="Policy Compliance"
        value="98.5%"
        hint="0 self-approvals detected"
        tone="ok"
      />
    </div>
  );
}
