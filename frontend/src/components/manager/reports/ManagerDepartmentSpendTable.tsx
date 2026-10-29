'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { reportingService } from '@/lib/api/services';
import { ProjectBreakdownReportDTO, ProjectSpendItemDTO } from '@/lib/api/types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { DEPARTMENT_SUMMARY } from './types';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

type Filter = 'all' | 'pending' | 'settled';

function formatKes(amount: string | number | undefined): string {
  const value = typeof amount === 'number' ? amount : Number(amount ?? 0);
  return `KES ${value.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
}

export function ManagerDepartmentSpendTable() {
  const [report, setReport] = useState<ProjectBreakdownReportDTO | null>(null);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await reportingService.getByProject());
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'We could not load the project spend report.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (DEMO_MODE) return;

    let ignore = false;

    void Promise.resolve().then(() => {
      reportingService
        .getByProject()
        .then((data) => {
          if (!ignore) setReport(data);
        })
        .catch((caught: unknown) => {
          if (ignore) return;
          setError(
            caught instanceof Error
              ? caught.message
              : 'We could not load the project spend report.'
          );
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    });

    return () => {
      ignore = true;
    };
  }, []);

  const rows = useMemo(() => {
    const results: ProjectSpendItemDTO[] = report?.results ?? [];
    if (filter === 'pending') return results.filter((row) => row.pending_count > 0);
    if (filter === 'settled') return results.filter((row) => row.pending_count === 0);
    return results;
  }, [report, filter]);

  if (DEMO_MODE) {
    return (
      <div className="rounded-xl border border-line bg-surface shadow-2xs overflow-hidden font-serif">
        <div className="border-b border-line p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-surface-subtle">
          <div>
            <h2 className="text-base font-bold text-ink">Department Spend Summary</h2>
            <p className="text-xs text-muted-ink">Audited operational disbursements by cost center.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink border-b border-line">
              <tr>
                <th className="px-5 py-3">Dept ID</th><th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-right">Approved Spend</th><th className="px-5 py-3">Approved Requests</th>
                <th className="px-5 py-3">Flagged Issues</th><th className="px-5 py-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {DEPARTMENT_SUMMARY.map((row) => (
                <tr key={row.id} className="transition hover:bg-canvas/50">
                  <td className="whitespace-nowrap px-5 py-3.5 font-serif text-xs text-muted-ink font-medium">{row.id}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink">{row.department}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">KES {row.totalSpent.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">{row.approvedCount} requisitions</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs">
                    {row.flaggedCount > 0 ? (
                      <span className="font-semibold text-warn">{row.flaggedCount} flagged</span>
                    ) : (
                      <span className="text-muted-ink">0</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        row.status === 'Compliant'
                          ? 'border border-ok/30 bg-ok/10 text-ok'
                          : 'border border-warn/30 bg-warn/10 text-warn'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface shadow-2xs overflow-hidden font-serif">
      <div className="border-b border-line p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-surface-subtle">
        <div>
          <h2 className="text-base font-bold text-ink">Department Spend Summary</h2>
          <p className="text-xs text-muted-ink">Audited operational disbursements by cost center.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-ink">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink focus:border-brand focus:outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Awaiting Approval</option>
            <option value="settled">Settled</option>
          </select>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="m-4 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </span>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 self-start rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : loading && !report ? (
        <div className="p-12 text-center text-xs text-muted-ink">Loading project spend report…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink border-b border-line">
              <tr>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-right">Total Value</th>
                <th className="px-5 py-3 text-right">Paid</th>
                <th className="px-5 py-3 text-right">Pending</th>
                <th className="px-5 py-3 text-center">Requests</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs text-muted-ink">
                    No payment activity for this filter yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.project_id} className="transition hover:bg-canvas/50">
                    <td className="whitespace-nowrap px-5 py-3.5 font-serif font-medium text-ink">
                      {row.project_name}
                      {row.project_code ? (
                        <span className="block text-[11px] text-muted-ink font-mono">
                          {row.project_code}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                      {row.department || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">
                      {formatKes(row.total_amount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ok">
                      {row.paid_count > 0 ? formatKes(row.paid_amount) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-warn">
                      {row.pending_count > 0 ? formatKes(row.pending_amount) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-center text-xs text-muted-ink">
                      {row.total_count} requisitions
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          row.pending_count > 0
                            ? 'border border-warn/30 bg-warn/10 text-warn'
                            : 'border border-ok/30 bg-ok/10 text-ok'
                        }`}
                      >
                        {row.pending_count > 0 ? 'Awaiting Approval' : 'Settled'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
