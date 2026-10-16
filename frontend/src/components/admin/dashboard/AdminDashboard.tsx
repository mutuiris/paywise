'use client';

import React from 'react';
import { PageHeader } from '../common/PageHeader';
import { AdminStats } from './AdminStats';
import { AdminQuickActions } from './AdminQuickActions';
import { ActivityTimeline } from './ActivityTimeline';
import { getAdminOverviewStats } from '@/data/mock-admin-store';
import { INITIAL_AUDIT_EVENTS } from '@/data/mock-admin-audit';

export function AdminDashboard() {
  const stats = getAdminOverviewStats();

  return (
    <div className="space-y-6 font-serif">
      <PageHeader
        title="Welcome back, Grace"
        description="Administrator dashboard · System governance and access management"
      />
      <AdminStats stats={stats} />
      <AdminQuickActions />
      <ActivityTimeline events={INITIAL_AUDIT_EVENTS} />
    </div>
  );
}
