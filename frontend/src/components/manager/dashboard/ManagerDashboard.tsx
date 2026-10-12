import React from 'react';
import {
  CURRENT_MANAGER,
  INITIAL_PAYMENT_REQUESTS,
  INITIAL_ACTIVITY_LOG,
  formatCurrency,
} from '@/data/mock-manager-data';
import { SummaryCard } from './SummaryCard';
import { RecentActivity } from './RecentActivity';

function buildMetrics() {
  const pending = INITIAL_PAYMENT_REQUESTS.filter(
    (r) => r.status === 'PENDING_APPROVAL' || r.status === 'SUBMITTED'
  );
  const approved = INITIAL_PAYMENT_REQUESTS.filter(
    (r) => r.status === 'APPROVED'
  );
  const paid = INITIAL_PAYMENT_REQUESTS.filter((r) => r.status === 'PAID');
  const rejected = INITIAL_PAYMENT_REQUESTS.filter(
    (r) => r.status === 'REJECTED'
  );

  const sum = (rows: typeof INITIAL_PAYMENT_REQUESTS) =>
    rows.reduce((total, r) => total + r.amount, 0);

  return [
    {
      label: 'Awaiting Approval',
      value: String(pending.length),
      hint: `${formatCurrency(sum(pending))} in review`,
      tone: 'warn' as const,
    },
    {
      label: 'Approved',
      value: String(approved.length),
      hint: `${formatCurrency(sum(approved))} cleared`,
      tone: 'ok' as const,
    },
    {
      label: 'Paid Out',
      value: String(paid.length),
      hint: `${formatCurrency(sum(paid))} settled`,
      tone: 'brand' as const,
    },
    {
      label: 'Rejected',
      value: String(rejected.length),
      hint: `${formatCurrency(sum(rejected))} declined`,
      tone: 'err' as const,
    },
  ];
}

export function ManagerDashboard() {
  const metrics = buildMetrics();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manager Dashboard</h1>
          <p className="mt-1 text-sm text-muted-ink">
            Approval queue health, spend snapshot, and recent audit activity.
          </p>
        </div>
        <div className="shrink-0 rounded-md border border-brand/30 bg-brand-light px-3 py-1.5 text-xs font-medium text-brand-deep">
          {CURRENT_MANAGER.approvalLimitLabel}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <SummaryCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            tone={metric.tone}
          />
        ))}
      </div>

      {/* Recent activity / audit trail */}
      <RecentActivity events={INITIAL_ACTIVITY_LOG} />
    </div>
  );
}
