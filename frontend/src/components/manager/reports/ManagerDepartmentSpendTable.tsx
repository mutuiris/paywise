'use client';

import React, { useState } from 'react';
import { DEPARTMENT_SUMMARY } from './types';

export function ManagerDepartmentSpendTable() {
  const [filter, setFilter] = useState<'all' | 'compliant' | 'review'>('all');
  const rows = DEPARTMENT_SUMMARY.filter((r) => filter === 'compliant' ? r.status === 'Compliant' : filter === 'review' ? r.status === 'Review Needed' : true);

  return (
    <div className="rounded-xl border border-line bg-surface shadow-2xs overflow-hidden font-serif">
      <div className="border-b border-line p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-surface-subtle">
        <div>
          <h2 className="text-base font-bold text-ink">Department Spend Summary</h2>
          <p className="text-xs text-muted-ink">Audited operational disbursements by cost center.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-ink">Filter:</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink focus:border-brand focus:outline-none">
            <option value="all">All</option><option value="compliant">Compliant</option><option value="review">Review Needed</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink border-b border-line">
            <tr><th className="px-5 py-3">Dept ID</th><th className="px-5 py-3">Department</th><th className="px-5 py-3 text-right">Approved Spend</th><th className="px-5 py-3">Approved Requests</th><th className="px-5 py-3">Flagged Issues</th><th className="px-5 py-3 text-right">Audit Status</th></tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-canvas/50">
                <td className="whitespace-nowrap px-5 py-3.5 font-serif text-xs text-muted-ink font-medium">{row.id}</td>
                <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink">{row.department}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">KES {row.totalSpent.toLocaleString()}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">{row.approvedCount} requisitions</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-xs">{row.flaggedCount > 0 ? <span className="font-semibold text-warn">{row.flaggedCount} flagged</span> : <span className="text-muted-ink">0</span>}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${row.status === 'Compliant' ? 'border border-ok/30 bg-ok/10 text-ok' : 'border border-warn/30 bg-warn/10 text-warn'}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
