'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, Eye } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import { formatCurrency, formatDate } from '@/data/mock-manager-data';
import { StatusBadge } from '../common/StatusBadge';

interface VendorHistoryTableProps {
  vendorName: string;
  vendorRequests: PaymentRequestItem[];
  basePath: string;
}

export function VendorHistoryTable({
  vendorName,
  vendorRequests,
  basePath,
}: VendorHistoryTableProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface overflow-hidden shadow-xs font-serif">
      <div className="border-b border-line px-5 py-4 bg-surface-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
            <FileText className="size-4 text-brand" />
            <span>Payment Request History</span>
          </h2>
          <p className="text-xs text-muted-ink mt-0.5">
            All historical requisitions and payouts submitted for {vendorName}
          </p>
        </div>
        <span className="text-xs font-medium text-muted-ink">
          {vendorRequests.length} {vendorRequests.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {vendorRequests.length === 0 ? (
        <div className="p-12 text-center">
          <CheckCircle2 className="mx-auto size-8 text-muted-ink/40" />
          <p className="mt-2 text-sm font-semibold text-ink">
            No payment requests submitted yet
          </p>
          <p className="mt-1 text-xs text-muted-ink">
            Payments submitted for this vendor will automatically appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas text-[11px] font-semibold text-muted-ink uppercase tracking-wider">
                  <th scope="col" className="px-5 py-3">Reference</th>
                  <th scope="col" className="px-5 py-3 text-right">Amount</th>
                  <th scope="col" className="px-5 py-3">Project</th>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {vendorRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <Link
                        href={`${basePath}/requests/${req.id}`}
                        className="font-serif text-[13px] font-semibold text-brand group-hover:underline block"
                      >
                        {req.reference}
                      </Link>
                      <span className="font-serif text-[11px] text-muted-ink block">
                        {req.invoiceNumber}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">
                      {formatCurrency(req.amount)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                      {req.project}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                      {formatDate(req.createdAt)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3.5">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <Link
                        href={`${basePath}/requests/${req.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas hover:border-brand/40 shadow-2xs"
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
          <ul className="divide-y divide-line lg:hidden">
            {vendorRequests.map((req) => (
              <li key={req.id}>
                <Link
                  href={`${basePath}/requests/${req.id}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/90 active:bg-slate-100 block transition-colors"
                >
                  <div>
                    <span className="font-serif text-[13px] font-semibold text-brand block">
                      {req.reference}
                    </span>
                    <p className="text-xs text-muted-ink mt-0.5">
                      {req.project} · {req.invoiceNumber}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={req.status} />
                    <Eye className="size-4 text-muted-ink group-hover:text-brand group-hover:scale-110 transition-all" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
