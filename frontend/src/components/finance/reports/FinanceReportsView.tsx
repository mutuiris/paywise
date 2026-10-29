'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FinanceReportsHeader } from './FinanceReportsHeader';
import { FinanceReportsStats } from './FinanceReportsStats';
import { FinanceDepartmentSpendTable, ProjectSpendRow } from './FinanceDepartmentSpendTable';
import { reportingService } from '@/lib/api/services';
import { ActivitySummaryDTO } from '@/lib/api/types';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function FinanceReportsView() {
  const [summary, setSummary] = useState<ActivitySummaryDTO | null>(null);
  const [projectRows, setProjectRows] = useState<ProjectSpendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const [sumRes, projRes] = await Promise.allSettled([
        reportingService.getSummary(),
        reportingService.getByProject(),
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value) {
        setSummary(sumRes.value);
      }

      if (projRes.status === 'fulfilled' && projRes.value?.results) {
        const mapped: ProjectSpendRow[] = projRes.value.results.map((p) => ({
          department: p.department || 'Operations',
          projectName: p.project_name,
          spent: p.paid_amount || p.total_amount,
          requestCount: p.total_count,
          topVendor: `Code: ${p.project_code || 'PRJ'}`,
        }));
        if (mapped.length > 0) {
          setProjectRows(mapped);
        }
      }

      setUsingFallback(false);
    } catch {
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      reportingService.getSummary(),
      reportingService.getByProject(),
    ]).then(([sumRes, projRes]) => {
      if (ignore) return;

      if (sumRes.status === 'fulfilled' && sumRes.value) {
        setSummary(sumRes.value);
      }

      if (projRes.status === 'fulfilled' && projRes.value?.results) {
        const mapped: ProjectSpendRow[] = projRes.value.results.map((p) => ({
          department: p.department || 'Operations',
          projectName: p.project_name,
          spent: p.paid_amount || p.total_amount,
          requestCount: p.total_count,
          topVendor: `Code: ${p.project_code || 'PRJ'}`,
        }));
        if (mapped.length > 0) {
          setProjectRows(mapped);
        }
      }

      setUsingFallback(false);
      setLoading(false);
    }).catch(() => {
      if (ignore) return;
      setUsingFallback(true);
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-6 font-serif">
      <FinanceReportsHeader onRefresh={() => fetchReports(true)} loading={loading} />

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3 text-xs text-muted-ink">
          <AlertCircle className="size-4 shrink-0 text-muted-ink" />
          <span>Could not load reporting data from the Paywise API. Try Refresh Data.</span>
        </div>
      )}

      <FinanceReportsStats
        totalDisbursed={summary?.total_paid_amount}
        totalPaidCount={summary?.total_paid_count}
        totalRequests={summary?.total_requests_count}
        awaitingApprovalCount={summary?.awaiting_approval_count}
      />
      <FinanceDepartmentSpendTable rows={projectRows} />
    </div>
  );
}
