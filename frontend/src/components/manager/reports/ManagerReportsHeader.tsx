'use client';

import React, { useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { reportingService } from '@/lib/api/services';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function ManagerReportsHeader() {
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    if (DEMO_MODE) {
      setExportError('Demo mode: the export uses live report data, so it is disabled here.');
      return;
    }

    setExporting(true);
    setExportError(null);

    try {
      const report = await reportingService.getByProject();
      const rows = report.results ?? [];

      const csvContent = [
        'Project,Project Code,Department,Total Value (KES),Paid (KES),Pending (KES),Requests,Paid Requests,Pending Requests',
        ...rows.map((row) =>
          [
            `"${row.project_name}"`,
            `"${row.project_code}"`,
            `"${row.department}"`,
            row.total_amount,
            row.paid_amount,
            row.pending_amount,
            row.total_count,
            row.paid_count,
            row.pending_count,
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `manager-spend-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (caught) {
      setExportError(
        caught instanceof Error ? caught.message : 'We could not export the spend report.'
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-serif">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Financial &amp; Approval Reports</h1>
        <p className="mt-1 text-sm text-muted-ink">Department spend distribution, approval SLAs and governance compliance auditing.</p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-2xs hover:bg-canvas transition cursor-pointer self-start sm:self-auto disabled:opacity-60"
        >
          <Download className="size-3.5 text-muted-ink" />
          <span>{exporting ? 'Preparing…' : 'Export CSV'}</span>
        </button>
        {exportError ? (
          <p role="alert" className="flex items-center gap-1.5 text-[11px] text-red-700">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{exportError}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
