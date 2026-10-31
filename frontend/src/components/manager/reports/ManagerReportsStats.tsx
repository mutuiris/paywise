'use client';

import React, { useEffect, useState } from 'react';
import { SummaryCard } from '@/components/common/SummaryCard';
import { reportingService } from '@/lib/api/services';
import { ActivitySummaryDTO } from '@/lib/api/types';
import { AlertCircle, RefreshCw } from 'lucide-react';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

/** Formats a decimal amount the backend returned, e.g. "140000.00" -> "KES 140,000". */
function formatKes(amount: string | number | undefined): string {
  const value = typeof amount === 'number' ? amount : Number(amount ?? 0);
  return `KES ${value.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
}

export function ManagerReportsStats() {
  const [summary, setSummary] = useState<ActivitySummaryDTO | null>(null);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await reportingService.getSummary());
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'We could not load the payment activity summary.'
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
        .getSummary()
        .then((data) => {
          if (!ignore) setSummary(data);
        })
        .catch((caught: unknown) => {
          if (ignore) return;
          setError(
            caught instanceof Error
              ? caught.message
              : 'We could not load the payment activity summary.'
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

  if (DEMO_MODE) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-serif">
        <SummaryCard
          label="Total Approved Volume"
          badge="MTD"
          value="KES 1,240,000"
          hint="+12% vs last month"
          tone="brand"
        />
        <SummaryCard
          label="Avg. Approval Turnaround"
          value="4.2 hrs"
          hint="18% faster than policy SLA"
          tone="ok"
        />
        <SummaryCard
          label="Secondary Sign-offs"
          badge=">50k"
          value="14"
          hint="Routed to Finance for clearance"
          tone="neutral"
        />
        <SummaryCard
          label="Policy Compliance"
          value="98.5%"
          hint="0 self-approvals detected"
          tone="ok"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
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
    );
  }

  if (loading && !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-serif">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[105px] animate-pulse rounded-xl border border-line bg-surface p-4"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Total Paid Volume"
        value={formatKes(summary?.total_paid_amount)}
        hint={`${summary?.total_paid_count ?? 0} settled requests`}
        tone="brand"
      />
      <SummaryCard
        label="Awaiting Approval"
        value={summary?.awaiting_approval_count ?? 0}
        hint={formatKes(summary?.awaiting_approval_amount)}
        tone="warn"
      />
      <SummaryCard
        label="Failed Payments"
        value={summary?.failed_payment_count ?? 0}
        hint={formatKes(summary?.failed_payment_amount)}
        tone={summary?.failed_payment_count ? 'err' : 'ok'}
      />
      <SummaryCard
        label="Total Requests"
        value={summary?.total_requests_count ?? 0}
        hint={formatKes(summary?.total_requested_amount)}
        tone="neutral"
      />
    </div>
  );
}
