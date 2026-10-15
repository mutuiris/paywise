'use client';

import React from 'react';
import { DEPARTMENT_SPEND } from './types';
import { formatCurrency } from '@/data/mock-manager-data';

export function FinanceDepartmentSpendTable() {
  return (
    <div className="rounded-xl border border-line bg-surface shadow-2xs  overflow-hidden">
      <div className="border-b border-line p-5 bg-surface-subtle">
        <h2 className="text-base font-bold text-ink">Cost Center Vendor Disbursements</h2>
        <p className="text-xs text-muted-ink">Reconciled monthly totals across company project operations.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink border-b border-line">
            <tr>
              <th className="px-5 py-3">Cost Center</th>
              <th className="px-5 py-3 text-right">Settled Amount</th>
              <th className="px-5 py-3">Disbursements</th>
              <th className="px-5 py-3">Primary Vendor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            {DEPARTMENT_SPEND.map((dept) => (
              <tr key={dept.department} className="transition hover:bg-canvas/50">
                <td className="whitespace-nowrap px-5 py-4 font-medium text-ink">{dept.department}</td>
                <td className="whitespace-nowrap px-5 py-4 text-right  font-semibold tabular-nums text-ink">{formatCurrency(dept.spent)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-muted-ink">{dept.requestCount} transactions</td>
                <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-brand-deep">{dept.topVendor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
