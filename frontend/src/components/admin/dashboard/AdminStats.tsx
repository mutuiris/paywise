'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SummaryCard } from '@/components/common/SummaryCard';
import { AdminOverviewStats } from '@/types/admin';

export interface AdminStatsProps {
  stats: AdminOverviewStats;
}

export function AdminStats({ stats }: AdminStatsProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <SummaryCard
        label="Total Users"
        value={stats.totalUsers}
        hint="Registered accounts"
        tone="neutral"
        onClick={() => router.push('/admin/users')}
      />
      <SummaryCard
        label="Active Users"
        value={stats.activeUsers}
        hint="Active directory state"
        tone="ok"
        onClick={() => router.push('/admin/users')}
      />
      <SummaryCard
        label="Vendors"
        value={stats.totalVendors}
        hint="Approved payees"
        tone="neutral"
        onClick={() => router.push('/admin/vendors')}
      />
      <SummaryCard
        label="Payment Requests"
        value={stats.totalRequests}
        hint="Tracked workflow total"
        tone="brand"
        onClick={() => router.push('/admin/requests')}
      />
    </div>
  );
}
