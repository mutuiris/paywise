'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FinanceDashboardHeader } from './FinanceDashboardHeader';
import { FinanceDashboardStats } from './FinanceDashboardStats';
import { FinanceActivityTable } from './FinanceActivityTable';
import { QueueItem, FailedItem, AttemptItem } from './types';
import { reportingService, approvalService, paymentService } from '@/lib/api/services';
import { ApiClientError } from '@/lib/api/client';
import { RefreshCw, AlertCircle } from 'lucide-react';

const toMethod = (method?: string): QueueItem['paymentMethod'] =>
  method === 'BANK' || method === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'MPESA';

interface DashboardData {
  awaitingApprovalCount: number;
  processingCount: number;
  paidCount: number;
  queue: QueueItem[];
  failed: FailedItem[];
  attempts: AttemptItem[];
}

const EMPTY: DashboardData = {
  awaitingApprovalCount: 0,
  processingCount: 0,
  paidCount: 0,
  queue: [],
  failed: [],
  attempts: [],
};

async function loadDashboard(): Promise<DashboardData> {
  const [summary, financeQueue, approved, processing, failedRes, attemptsRes] = await Promise.all([
    reportingService.getSummary(),
    approvalService.getQueue({ tier: 'FINANCE' }),
    paymentService.listRequests({ status: 'APPROVED' }),
    paymentService.listRequests({ status: 'PROCESSING', limit: '1' }),
    reportingService.getFailedPayments(),
    paymentService.listAttempts(),
  ]);

  return {
    awaitingApprovalCount: financeQueue.count ?? financeQueue.results.length,
    processingCount: processing.count ?? 0,
    paidCount: summary.total_paid_count ?? 0,
    queue: (approved.results ?? []).map((r) => ({
      id: r.id,
      reference: r.invoice_number || `PR-${r.id.slice(0, 6).toUpperCase()}`,
      vendorName: r.vendor_name || 'Vendor',
      amount: parseFloat(r.amount) || 0,
      invoiceNumber: r.invoice_number || `INV-${r.id.slice(0, 6).toUpperCase()}`,
      paymentMethod: toMethod(r.payment_method),
      accountDetails: 'Vendor payout details on file',
    })),
    failed: (failedRes.results ?? []).map((f) => ({
      id: f.id,
      reference: f.invoice_number,
      vendorName: f.vendor_name || 'Vendor',
      amount: parseFloat(f.amount) || 0,
      paymentMethod: toMethod(f.payment_method),
      failureReason: f.failure_reason ? f.failure_reason.replace(/^simulated gateway error:\s*/i, '').trim() : '',
    })),
    attempts: attemptsRes.results.slice(0, 10).map((a) => ({
      id: a.id,
      paymentRequestId: a.payment_request_id,
      reference: a.invoice_number || `PR-${a.payment_request_id.slice(0, 6).toUpperCase()}`,
      vendorName: a.vendor_name || 'Vendor',
      amount: parseFloat(a.amount) || 0,
      status: a.status === 'SUCCESS' ? 'SUCCEEDED' : a.status,
      startedAt: a.created_at || '',
      providerReference: a.provider_reference || undefined,
    })),
  };
}

export function FinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>(EMPTY);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loadDashboard());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Unable to reach the Paywise API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    loadDashboard()
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof ApiClientError ? err.message : 'Unable to reach the Paywise API.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <FinanceDashboardHeader />
        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      <FinanceDashboardStats
        queueCount={data.queue.length}
        failedCount={data.failed.length}
        awaitingApprovalCount={data.awaitingApprovalCount}
        paidCount={data.paidCount}
        processingCount={data.processingCount}
      />

      <FinanceActivityTable
        queueItems={data.queue}
        attemptItems={data.attempts}
        failedItems={data.failed}
      />
    </div>
  );
}
