'use client';

import React from 'react';
import { SummaryCard } from '@/components/common/SummaryCard';

export function FinanceReportsStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-serif">
      <SummaryCard
        label="Total Disbursed"
        badge="MTD"
        value="KES 1,480,200"
        hint="+14.2% MoM · 14 settled payouts"
        tone="brand"
      />
      <SummaryCard
        label="Via M-Pesa B2C"
        value="KES 640,900"
        hint="43.3% of total volume"
        tone="ok"
      />
      <SummaryCard
        label="Via Bank RTGS / EFT"
        value="KES 839,300"
        hint="56.7% of total volume"
        tone="neutral"
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
