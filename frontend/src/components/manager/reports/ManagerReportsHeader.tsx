'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { DEPARTMENT_SUMMARY } from './types';

export function ManagerReportsHeader() {
  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Dept ID,Department,Total Approved Spend (KES),Approved Requests,Flagged Issues,Status']
        .concat(DEPARTMENT_SUMMARY.map((r) => `${r.id},"${r.department}",${r.totalSpent},${r.approvedCount},${r.flaggedCount},${r.status}`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manager-spend-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-serif">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Financial & Approval Reports</h1>
        <p className="mt-1 text-sm text-muted-ink">Department spend distribution, approval SLAs and governance compliance auditing.</p>
      </div>
      <button
        type="button"
        onClick={handleExportCsv}
        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-2xs hover:bg-canvas transition cursor-pointer self-start sm:self-auto"
      >
        <Download className="size-3.5 text-muted-ink" /><span>Export CSV</span>
      </button>
    </div>
  );
}
