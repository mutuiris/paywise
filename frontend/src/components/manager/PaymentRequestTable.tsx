'use client';

import React, { useState } from 'react';
import { Search, Eye, CheckCircle2 } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import {
  formatCurrency,
  formatDate,
  getApprovalRoute,
} from '@/data/mock-manager-data';
import { StatusBadge } from './StatusBadge';

interface PaymentRequestTableProps {
  requests: PaymentRequestItem[];
  onReview: (request: PaymentRequestItem) => void;
  title?: string;
  showFilters?: boolean;
}

export function PaymentRequestTable({
  requests,
  onReview,
  title = 'Requests Awaiting Approval',
  showFilters = true,
}: PaymentRequestTableProps) {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNDER_50K' | 'OVER_50K'>('ALL');

  const filteredRequests = requests.filter((req) => {
    const matchesTab =
      filterTab === 'ALL'
        ? true
        : filterTab === 'UNDER_50K'
        ? req.amount <= 50000
        : req.amount > 50000;

    if (!matchesTab) return false;

    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      req.reference.toLowerCase().includes(query) ||
      req.vendorName.toLowerCase().includes(query) ||
      req.invoiceNumber.toLowerCase().includes(query) ||
      req.project.toLowerCase().includes(query) ||
      req.requesterName.toLowerCase().includes(query)
    );
  });

  return (
    <section className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs font-serif">
      {/* Table Header / Action Bar */}
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between bg-surface-subtle">
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="text-xs text-muted-ink mt-0.5">
            {filteredRequests.length} {filteredRequests.length === 1 ? 'item' : 'items'} awaiting review
          </p>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:w-64 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-ink" />
              <input
                type="text"
                placeholder="Filter requests…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-muted-ink/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {/* Threshold Filter Tabs */}
            <div className="flex rounded-md border border-line bg-canvas p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterTab('ALL')}
                className={`rounded px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  filterTab === 'ALL'
                    ? 'bg-surface text-ink shadow-xs font-semibold'
                    : 'text-muted-ink hover:text-ink'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('UNDER_50K')}
                className={`rounded px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  filterTab === 'UNDER_50K'
                    ? 'bg-surface text-ink shadow-xs font-semibold'
                    : 'text-muted-ink hover:text-ink'
                }`}
              >
                ≤ 50k (Single)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('OVER_50K')}
                className={`rounded px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  filterTab === 'OVER_50K'
                    ? 'bg-surface text-ink shadow-xs font-semibold'
                    : 'text-muted-ink hover:text-ink'
                }`}
              >
                &gt; 50k (Dual)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center">
          <CheckCircle2 className="mx-auto size-10 text-muted-ink/40" />
          <h3 className="mt-3 text-sm font-semibold text-ink">
            No pending requests found
          </h3>
          <p className="mt-1 text-xs text-muted-ink">
            {search
              ? 'Try changing your search query or filter tab.'
              : 'All pending payment requests have been reviewed.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas text-[11px] font-semibold text-muted-ink uppercase tracking-wider">
                  <th scope="col" className="px-5 py-3">Request ID</th>
                  <th scope="col" className="px-5 py-3">Vendor</th>
                  <th scope="col" className="px-5 py-3 text-right">Amount</th>
                  <th scope="col" className="px-5 py-3">Requester</th>
                  <th scope="col" className="px-5 py-3">Project</th>
                  <th scope="col" className="px-5 py-3">Submitted</th>
                  <th scope="col" className="px-5 py-3">Approval Level</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredRequests.map((req) => {
                  const route = getApprovalRoute(req.amount);
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-canvas/60 transition-colors group cursor-pointer"
                      onClick={() => onReview(req)}
                    >
                      {/* Reference */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="font-mono text-[13px] font-semibold text-brand group-hover:underline">
                          {req.reference}
                        </span>
                        <span className="block font-mono text-[11px] text-muted-ink">
                          {req.invoiceNumber}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="font-semibold text-ink block">
                          {req.vendorName}
                        </span>
                        <span className="text-[11px] text-muted-ink truncate max-w-[180px] block">
                          {req.reason}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono font-semibold tabular-nums text-ink">
                        {formatCurrency(req.amount)}
                      </td>

                      {/* Requester */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink text-xs font-medium">
                        {req.requesterName}
                      </td>

                      {/* Project */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                        {req.project}
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                        {formatDate(req.createdAt)}
                      </td>

                      {/* Approval Route */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-[11px] font-medium ${
                            route.isDual
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {route.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>

                      {/* Action */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onReview(req)}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas hover:border-brand/40 cursor-pointer transition-all shadow-2xs"
                        >
                          <Eye className="size-3.5 text-muted-ink" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Small Devices List */}
          <ul className="divide-y divide-line lg:hidden" aria-label={title}>
            {filteredRequests.map((req) => (
              <li
                key={req.id}
                className="group flex items-center justify-between p-4 hover:bg-slate-50/90 active:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => onReview(req)}
              >
                <div className="min-w-0 pr-3">
                  <span className="font-mono text-[13px] font-semibold text-brand group-hover:text-brand-deep group-hover:underline block transition-colors">
                    {req.reference}
                  </span>
                  <p className="mt-0.5 font-semibold text-ink text-sm truncate group-hover:text-brand-deep transition-colors">
                    {req.vendorName}
                  </p>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2.5">
                  <span className="font-mono text-sm font-semibold tabular-nums text-ink">
                    {formatCurrency(req.amount)}
                  </span>
                  <Eye className="size-4 text-muted-ink group-hover:text-brand group-hover:scale-110 transition-all" />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
