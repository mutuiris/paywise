'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { formatCurrency } from '@/data/mock-manager-data';
import { SummaryCard } from '@/components/common/SummaryCard';

const DEPARTMENT_SPEND = [
  {
    department: 'Engineering & Infrastructure',
    spent: 615000,
    requestCount: 6,
    topVendor: 'Apex Electricals',
  },
  {
    department: 'Operations & Facilities',
    spent: 420000,
    requestCount: 4,
    topVendor: 'PowerHire Kenya',
  },
  {
    department: 'Procurement & Logistics',
    spent: 285200,
    requestCount: 3,
    topVendor: 'SwiftHaul Logistics',
  },
  {
    department: 'Site Office Supplies',
    spent: 160000,
    requestCount: 2,
    topVendor: 'Metro Hardware Ltd.',
  },
];

export function FinanceReportsView() {
  const [dateRange, setDateRange] = useState('OCT_2026');

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Financial &amp; Disbursement Reports
          </h1>
          <p className="mt-1 text-sm text-muted-ink">
            Consolidated overview of vendor payments, channels (M-Pesa vs RTGS), and compliance audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink focus:border-brand focus:outline-none"
          >
            <option value="OCT_2026">October 2026 (Current)</option>
            <option value="SEP_2026">September 2026</option>
            <option value="Q3_2026">Q3 2026</option>
          </select>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas cursor-pointer shadow-2xs"
          >
            <Download className="size-3.5 text-muted-ink" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Department Breakdown Table */}
      <div className="rounded-xl border border-line bg-surface shadow-2xs">
        <div className="border-b border-line p-5">
          <h2 className="text-base font-bold text-ink">
            Cost Center Vendor Disbursements
          </h2>
          <p className="text-xs text-muted-ink">
            Reconciled monthly totals across company project operations.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
              <tr>
                <th className="px-5 py-3">Cost Center / Department</th>
                <th className="px-5 py-3 text-right">Paid Volume</th>
                <th className="px-5 py-3">Settled Transactions</th>
                <th className="px-5 py-3">Primary Supplier</th>
                <th className="px-5 py-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {DEPARTMENT_SPEND.map((dept) => (
                <tr key={dept.department} className="transition hover:bg-canvas/50">
                  <td className="px-5 py-4 font-medium text-ink">
                    {dept.department}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-serif font-semibold tabular-nums text-ink">
                    {formatCurrency(dept.spent)}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-ink">
                    {dept.requestCount} transactions
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-brand-deep">
                    {dept.topVendor}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      <span>Cleared</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
