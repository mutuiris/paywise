'use client';

import { useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, SearchX } from 'lucide-react';
import type { PaymentRequestItem, PaymentStatus } from '@/types/manager';
import {
  INITIAL_PAYMENT_REQUESTS,
  formatCurrency,
  formatDate,
  getApprovalRoute,
} from '@/data/mock-manager-data';
import { StatusBadge } from '@/components/manager/common/StatusBadge';

type StatusFilter = 'ALL' | PaymentStatus;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING_APPROVAL', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'PAID', label: 'Paid' },
  { key: 'REJECTED', label: 'Rejected' },
];

function matchesStatus(req: PaymentRequestItem, tab: StatusFilter): boolean {
  if (tab === 'ALL') return true;
  if (tab === 'PENDING_APPROVAL') {
    return req.status === 'PENDING_APPROVAL' || req.status === 'SUBMITTED';
  }
  return req.status === tab;
}

function matchesQuery(req: PaymentRequestItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    req.reference.toLowerCase().includes(q) ||
    req.vendorName.toLowerCase().includes(q) ||
    req.invoiceNumber.toLowerCase().includes(q) ||
    req.requesterName.toLowerCase().includes(q)
  );
}

export function RequestsView() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams.get('q') ?? '';

  const [statusTab, setStatusTab] = useState<StatusFilter>('ALL');

  const handleQueryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  };

  const tabCounts = useMemo(
    () =>
      STATUS_TABS.map((tab) => ({
        ...tab,
        count: INITIAL_PAYMENT_REQUESTS.filter((req) =>
          matchesStatus(req, tab.key)
        ).length,
      })),
    []
  );

  const filteredRequests = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return INITIAL_PAYMENT_REQUESTS.filter(
      (req) => matchesStatus(req, statusTab) && matchesQuery(req, trimmed)
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [query, statusTab]);

  const activeStatusLabel =
    STATUS_TABS.find((tab) => tab.key === statusTab)?.label ?? '';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page header */}
      <div className="border-b border-line pb-4">
        <h1 className="text-2xl font-bold text-ink">Payment Requests</h1>
        <p className="mt-1 text-sm text-muted-ink">
          Track vendor payment requests and their approval progress across
          ImaraWorks projects.
        </p>
      </div>

      {/* Toolbar: search + status filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="requests-search" className="sr-only">
            Search payment requests
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-ink"
          />
          <input
            id="requests-search"
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search reference, vendor, invoice…"
            className="w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-muted-ink/70 transition-all focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div
          className="flex flex-wrap gap-1 rounded-md border border-line bg-canvas p-0.5 text-xs"
          role="group"
          aria-label="Filter requests by status"
        >
          {tabCounts.map((tab) => {
            const isActive = statusTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key)}
                aria-pressed={isActive}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  isActive
                    ? 'bg-surface text-ink shadow-xs font-semibold'
                    : 'text-muted-ink hover:text-ink'
                }`}
              >
                {tab.label}
                <span className="ml-1 text-[11px] text-subtle-ink">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-ink" role="status">
        Showing {filteredRequests.length} of{' '}
        {INITIAL_PAYMENT_REQUESTS.length} requests
      </p>

      {/* Empty state */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-xs">
          <SearchX
            className="mx-auto size-10 text-subtle-ink"
            aria-hidden="true"
          />
          <h3 className="mt-3 text-sm font-semibold text-ink">
            No requests found
          </h3>
          <p className="mt-1 text-sm text-muted-ink">
            {query ? (
              <>
                Nothing matches &ldquo;{query}&rdquo;
                {statusTab !== 'ALL' ? ` in ${activeStatusLabel}` : ''}.
              </>
            ) : (
              'No payment requests match this filter.'
            )}
          </p>
          {query ? (
            <button
              type="button"
              onClick={() => handleQueryChange('')}
              className="mt-4 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-canvas"
            >
              Clear search
            </button>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface-subtle text-xs font-semibold uppercase tracking-wide text-muted-ink">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Reference
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Requester
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Vendor &amp; Request
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Approval Route
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredRequests.map((req) => {
                  const route = getApprovalRoute(req.amount);
                  return (
                    <tr
                      key={req.id}
                      className="transition-colors hover:bg-surface-subtle"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">
                          {req.reference}
                        </div>
                        <div className="text-xs text-muted-ink">
                          Invoice {req.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">
                        {req.requesterName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">
                          {req.vendorName}
                        </div>
                        <div className="text-xs text-muted-ink">
                          {req.reason} · {req.project}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        {formatCurrency(req.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                            route.isDual
                              ? 'border-warn/30 bg-warn/10 text-warn'
                              : 'border-ok/30 bg-ok/10 text-ok'
                          }`}
                        >
                          {route.isDual
                            ? '> KES 50k · Manager + Finance'
                            : '\u2264 KES 50k · Manager'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-secondary">
                        {formatDate(req.submittedAt ?? req.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
