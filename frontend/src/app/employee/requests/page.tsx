'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { useApiResource } from '@/hooks/useApiResource';
import { listPaymentRequests } from '@/api/payments';
import {
  DemoDataBanner,
  ErrorState,
  TableSkeleton,
} from '@/components/employee/AsyncState';
import { PaymentStatusBadge } from '@/components/employee/StatusBadge';
import { DEMO_MODE } from '@/lib/config';
import { formatKes } from '@/lib/money';
import { formatDate } from '@/lib/format';
import { demoPaymentRequests } from '@/data/demo-employee-data';
import type { PaymentRequest, PaymentRequestStatus } from '@/types/domain';

const FILTERS: Array<{ label: string; statuses: PaymentRequestStatus[] | null }> = [
  { label: 'All', statuses: null },
  { label: 'Pending', statuses: ['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL'] },
  { label: 'Approved', statuses: ['APPROVED'] },
  { label: 'Paid', statuses: ['PAID'] },
  { label: 'Rejected', statuses: ['REJECTED'] },
];

function EmployeeRequestsContent() {
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();
  const [activeFilter, setActiveFilter] = useState('All');

  const resource = useApiResource<PaymentRequest[]>('employee-requests', () =>
    DEMO_MODE ? Promise.resolve(demoPaymentRequests) : listPaymentRequests(),
  );

  const requests = useMemo(() => resource.data ?? [], [resource.data]);

  const filteredRequests = useMemo(() => {
    const filter = FILTERS.find((item) => item.label === activeFilter);

    return requests.filter((request) => {
      const matchesStatus = !filter?.statuses || filter.statuses.includes(request.status);
      if (!matchesStatus) return false;
      if (!query) return true;

      return [
        request.vendor_name,
        request.invoice_number,
        request.id,
        request.project_name,
        request.requester_username,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [requests, activeFilter, query]);

  const showError = Boolean(resource.error) && !resource.data;

  return (
    <div className="space-y-6">
      <DemoDataBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your submitted site payment requests and invoices.
          </p>
        </div>
        <Link
          href="/employee/requests/new"
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Payment Request</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setActiveFilter(filter.label)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.label
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-500 font-medium">
          Showing {filteredRequests.length} requests
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {resource.loading && !showError ? (
          <TableSkeleton rows={6} columns={7} />
        ) : showError ? (
          <ErrorState
            error={resource.error!}
            onRetry={resource.reload}
            context="We could not load your payment requests."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Request ID</th>
                  <th className="py-3.5 px-6">Vendor</th>
                  <th className="py-3.5 px-6">Project</th>
                  <th className="py-3.5 px-6">Invoice Ref</th>
                  <th className="py-3.5 px-6">Amount (KES)</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50/80 transition-colors"
                      title={request.rejection_reason || undefined}
                    >
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {request.id.slice(0, 8)}
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium">
                        {request.vendor_name ?? 'Unknown vendor'}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {request.project_name ?? 'Unassigned'}
                      </td>
                      <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                        {request.invoice_number}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {formatKes(request.amount)}
                      </td>
                      <td className="py-4 px-6">
                        <PaymentStatusBadge status={request.status} />
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No requests found matching your filter or search query.
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

export default function EmployeeRequestsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} columns={7} />}>
      <EmployeeRequestsContent />
    </Suspense>
  );
}
