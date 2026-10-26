'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PlusCircle, FileText, Eye } from 'lucide-react';
import { useApiResource } from '@/hooks/useApiResource';
import { listPaymentRequests } from '@/api/payments';
import {
  CardSkeleton,
  DemoDataBanner,
  ErrorState,
  TableSkeleton,
} from '@/components/employee/AsyncState';
import { PaymentStatusBadge } from '@/components/employee/StatusBadge';
import { DEMO_MODE } from '@/lib/config';
import { formatKes } from '@/lib/money';
import { formatDateTime } from '@/lib/format';
import { demoPaymentRequests } from '@/data/demo-employee-data';
import type { PaymentRequest } from '@/types/domain';

type QueueFilter = 'ALL' | 'AWAITING' | 'READY' | 'FAILED';

const AWAITING_STATUSES = new Set(['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL']);

function matchesFilter(request: PaymentRequest, filter: QueueFilter): boolean {
  if (filter === 'AWAITING') return AWAITING_STATUSES.has(request.status);
  if (filter === 'READY') return request.status === 'APPROVED';
  if (filter === 'FAILED') return request.status === 'FAILED';
  return true;
}

function EmployeeDashboardContent() {
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();
  const [queue, setQueue] = useState<QueueFilter>('ALL');

  const resource = useApiResource<PaymentRequest[]>('employee-dashboard', () =>
    DEMO_MODE ? Promise.resolve(demoPaymentRequests) : listPaymentRequests(),
  );

  const requests = useMemo(() => resource.data ?? [], [resource.data]);

  const metrics = useMemo(() => {
    return {
      awaiting: requests.filter((request) => AWAITING_STATUSES.has(request.status)).length,
      ready: requests.filter((request) => request.status === 'APPROVED').length,
      processing: requests.filter((request) => request.status === 'PROCESSING').length,
      paid: requests.filter((request) => request.status === 'PAID').length,
      failed: requests.filter((request) => request.status === 'FAILED').length,
    };
  }, [requests]);

  const visibleRequests = useMemo(() => {
    const filtered = requests.filter((request) => {
      if (!matchesFilter(request, queue)) return false;
      if (!query) return true;
      return [request.vendor_name, request.invoice_number, request.id, request.project_name]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });

    return [...filtered]
      .sort((left, right) => (left.created_at < right.created_at ? 1 : -1))
      .slice(0, 8);
  }, [requests, queue, query]);

  const showError = Boolean(resource.error) && !resource.data;

  return (
    <div className="space-y-6">
      <DemoDataBanner />

      {/* Title Header with Serif Font */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Site Engineer Dashboard & Request Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/employee/requests/new"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Process Requests</span>
          </Link>
          <Link
            href="/employee/reports"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-colors text-sm"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span>Summary</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      {resource.loading && !showError ? (
        <CardSkeleton count={5} />
      ) : showError ? (
        <ErrorState
          error={resource.error!}
          onRetry={resource.reload}
          context="We could not load your payment requests."
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-900">Awaiting Approval</p>
            <p className="text-2xl font-bold text-gray-900 mt-3">{metrics.awaiting}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-900">Ready for Processing</p>
            <p className="text-2xl font-bold text-gray-900 mt-3">{metrics.ready}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-900">Processing</p>
            <p className="text-2xl font-bold text-gray-900 mt-3">{metrics.processing}</p>
            <p className="text-[11px] text-amber-600 mt-1 font-medium">
              Includes unconfirmed outcomes
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-900">Paid</p>
            <p className="text-2xl font-bold text-gray-900 mt-3">{metrics.paid}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-900">Failed</p>
            <p className="text-2xl font-bold text-gray-900 mt-3">{metrics.failed}</p>
          </div>
        </div>
      )}

      {/* Requests Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Payment Requests</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Your latest requests and their current approval status
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">
            {(
              [
                { key: 'ALL', label: `All (${requests.length})` },
                { key: 'AWAITING', label: `Awaiting (${metrics.awaiting})` },
                { key: 'READY', label: `Ready (${metrics.ready})` },
                { key: 'FAILED', label: `Failed (${metrics.failed})` },
              ] as Array<{ key: QueueFilter; label: string }>
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setQueue(tab.key)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  queue === tab.key
                    ? 'bg-white text-gray-900 shadow-xs font-semibold'
                    : 'hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {resource.loading && !showError ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Reference</th>
                  <th className="py-3 px-6">Vendor</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Invoice Ref</th>
                  <th className="py-3 px-6">Created</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {visibleRequests.length > 0 ? (
                  visibleRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-blue-600">
                        {request.id.slice(0, 8)}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {request.vendor_name ?? 'Unknown vendor'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {formatKes(request.amount)}
                      </td>
                      <td className="py-4 px-6">
                        <PaymentStatusBadge status={request.status} />
                      </td>
                      <td className="py-4 px-6 font-mono text-gray-500">
                        {request.invoice_number}
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {formatDateTime(request.created_at)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href="/employee/requests"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-200 rounded-lg text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-400" />
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No payment requests match this view yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  return (
    <Suspense fallback={<CardSkeleton count={5} />}>
      <EmployeeDashboardContent />
    </Suspense>
  );
}
