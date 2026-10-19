'use client';

import React from 'react';
import { DEPARTMENT_SPEND } from './types';
import { formatCurrency } from '@/data/mock-manager-data';

export interface ProjectSpendRow {
  department: string;
  projectName?: string;
  spent: number | string;
  requestCount: number;
  topVendor?: string;
}

interface FinanceDepartmentSpendTableProps {
  rows?: ProjectSpendRow[];
}

export function FinanceDepartmentSpendTable({ rows }: FinanceDepartmentSpendTableProps = {}) {
  const displayRows: ProjectSpendRow[] = rows && rows.length > 0 ? rows : DEPARTMENT_SPEND;

  return (
    <div className="rounded-xl border border-line bg-surface shadow-2xs font-serif overflow-hidden">
      <div className="border-b border-line p-5 bg-surface-subtle">
        <h2 className="text-base font-bold text-ink">Project & Department Disbursements</h2>
        <p className="text-xs text-muted-ink">Disbursement totals grouped by project and organizational cost center.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink border-b border-line">
            <tr>
              <th className="px-5 py-3">Cost Center / Project</th>
              <th className="px-5 py-3 text-right">Settled Amount</th>
              <th className="px-5 py-3">Disbursements</th>
              <th className="px-5 py-3">Vendor / Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            {displayRows.map((dept, idx) => (
              <tr key={dept.projectName ? `${dept.department}-${dept.projectName}` : `${dept.department}-${idx}`} className="transition hover:bg-canvas/50">
                <td className="whitespace-nowrap px-5 py-4 font-medium text-ink">
                  <div>{dept.department}</div>
                  {dept.projectName && <div className="text-xs text-muted-ink font-normal">{dept.projectName}</div>}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-serif font-semibold tabular-nums text-ink">
                  {typeof dept.spent === 'number' ? formatCurrency(dept.spent) : dept.spent}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-muted-ink">{dept.requestCount} transactions</td>
                <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-brand-deep">{dept.topVendor || 'Various Vendors'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
