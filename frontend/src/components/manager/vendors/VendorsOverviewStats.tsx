'use client';

import React from 'react';
import { formatCurrency } from '@/data/mock-manager-data';
import { SummaryCard } from '../dashboard/SummaryCard';

interface VendorsOverviewStatsProps {
  totalVendors: number;
  activeVendors: number;
  totalCumulativePaid: number;
  totalRequisitions: number;
}

export function VendorsOverviewStats({
  totalVendors,
  activeVendors,
  totalCumulativePaid,
  totalRequisitions,
}: VendorsOverviewStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 font-serif">
      <SummaryCard
        label="Total Registered"
        value={totalVendors}
        tone="neutral"
      />
      <SummaryCard
        label="Total Active"
        value={activeVendors}
        tone="brand"
      />
      <SummaryCard
        label="Total Disbursed"
        value={formatCurrency(totalCumulativePaid)}
        tone="ok"
      />
      <SummaryCard
        label="Total Requisitions"
        value={totalRequisitions}
        tone="warn"
      />
    </div>
  );
}
