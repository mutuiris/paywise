'use client';

import React from 'react';
import { SummaryCard } from '@/components/common/SummaryCard';
import { AdminOverviewStats } from '@/types/admin';

export interface AdminStatsProps {
  stats: AdminOverviewStats;
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 font-serif">
      <SummaryCard
        label="Total Users"
        value={stats.totalUsers}
        hint="Registered accounts"
        tone="neutral"
      />
      <SummaryCard
        label="Active Users"
        value={stats.activeUsers}
        hint="Active directory state"
        tone="ok"
      />
      <SummaryCard
        label="Vendors"
        value={stats.totalVendors}
        hint="Approved payees"
        tone="neutral"
      />
      <SummaryCard
        label="Payment Requests"
        value={stats.totalRequests}
        hint="Tracked workflow total"
        tone="brand"
      />
    </div>
  );
}
