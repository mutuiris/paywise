'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import { formatCurrency, formatDate } from '@/data/mock-manager-data';
import { StatusBadge } from '../common/StatusBadge';

export interface RequestsTableProps {
  requests: PaymentRequestItem[];
  basePath: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RequestsTable({
  requests,
  basePath,
  currentPage,
  totalPages,
  onPageChange,
}: RequestsTableProps) {
  if (requests.length === 0) {
    return (
      <section className="rounded-xl border border-line bg-surface p-12 text-center shadow-xs">
        <FileText className="mx-auto size-10 text-muted-ink/40" />
        <h3 className="mt-3 text-sm font-semibold text-ink">
          No matching payment requests
        </h3>
        <p className="mt-1 text-xs text-muted-ink">
          Try adjusting your search query or filters.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs font-serif">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas text-[11px] font-semibold text-muted-ink uppercase tracking-wider">
              <th scope="col" className="px-5 py-3">Request ID</th>
              <th scope="col" className="px-5 py-3">Vendor</th>
              <th scope="col" className="px-5 py-3 text-right">Amount</th>
              <th scope="col" className="px-5 py-3">Project</th>
              <th scope="col" className="px-5 py-3">Requester</th>
              <th scope="col" className="px-5 py-3">Method</th>
              <th scope="col" className="px-5 py-3">Date</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
              >
                {/* ID */}
                <td className="whitespace-nowrap px-5 py-3.5">
                  <Link
                    href={`${basePath}/requests/${req.id}`}
                    className="font-serif text-[13px] font-semibold text-brand group-hover:underline"
                  >
                    {req.reference}
                  </Link>
                  <span className="block font-serif text-[11px] text-muted-ink">
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
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">
                  {formatCurrency(req.amount)}
                </td>

                {/* Project */}
                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                  {req.project}
                </td>

                {/* Requester */}
                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink font-medium">
                  {req.requesterName}
                </td>

                {/* Method */}
                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                  {req.paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank'}
                </td>

                {/* Date */}
                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                  {formatDate(req.createdAt)}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-5 py-3.5">
                  <StatusBadge status={req.status} />
                </td>

                {/* Action Link */}
                <td className="whitespace-nowrap px-5 py-3.5 text-right">
                  <Link
                    href={`${basePath}/requests/${req.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas hover:border-brand/40 cursor-pointer transition-all shadow-2xs"
                  >
                    <Eye className="size-3.5 text-muted-ink" />
                    <span>View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <ul className="divide-y divide-line lg:hidden" aria-label="Payment requests">
        {requests.map((req) => (
          <li key={req.id}>
            <Link
              href={`${basePath}/requests/${req.id}`}
              className="group flex items-center justify-between p-4 hover:bg-slate-50/90 active:bg-slate-100 transition-colors block"
            >
              <div className="min-w-0 pr-3">
                <span className="font-serif text-[13px] font-semibold text-brand group-hover:text-brand-deep group-hover:underline block transition-colors">
                  {req.reference}
                </span>
                <p className="mt-0.5 font-semibold text-ink text-sm truncate group-hover:text-brand-deep transition-colors">
                  {req.vendorName}
                </p>
              </div>

              <div className="shrink-0">
                <Eye className="size-4 text-muted-ink group-hover:text-brand group-hover:scale-110 transition-all" />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-5 py-3 bg-surface-subtle text-xs">
          <span className="text-muted-ink">
            Page <strong className="text-ink">{currentPage}</strong> of{' '}
            <strong className="text-ink">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
