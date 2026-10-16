'use client';

import React from 'react';
import { FinanceDashboardHeader } from './FinanceDashboardHeader';
import { FinanceDashboardStats } from './FinanceDashboardStats';
import { FinanceActivityTable } from './FinanceActivityTable';
import { QUEUE_ITEMS, ATTEMPT_ITEMS, FAILED_ITEMS } from './mockData';

export function FinanceDashboard() {
  return (
    <div className="space-y-6 font-serif">
      <FinanceDashboardHeader />
      <FinanceDashboardStats
        queueCount={QUEUE_ITEMS.length}
        failedCount={FAILED_ITEMS.length}
      />
      <FinanceActivityTable
        queueItems={QUEUE_ITEMS}
        attemptItems={ATTEMPT_ITEMS}
        failedItems={FAILED_ITEMS}
      />
    </div>
  );
}
