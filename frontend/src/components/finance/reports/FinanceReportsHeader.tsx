'use client';

import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { DEPARTMENT_SPEND } from './types';

interface FinanceReportsHeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export function FinanceReportsHeader({ onRefresh, loading }: FinanceReportsHeaderProps = {}) {
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Department,Spent (KES),Transactions,Top Vendor']
        .concat(DEPARTMENT_SPEND.map((d) => `"${d.department}",${d.spent},${d.requestCount},"${d.topVendor}"`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finance-disbursements-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between font-serif pb-2">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Disbursement Analytics & Reports
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Summary of completed payouts, transaction volumes and cost-center allocations.
        </p>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-2 shrink-0 sm:ml-auto">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs sm:text-sm font-semibold text-brand-foreground shadow-2xs hover:bg-brand-deep transition-all cursor-pointer active:scale-95"
        >
          <Download className="size-4 shrink-0" />
          <span>Export CSV</span>
        </button>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        )}
      </div>
    </div>
  );
}
