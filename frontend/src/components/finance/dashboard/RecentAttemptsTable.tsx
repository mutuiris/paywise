'use client';

import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { AttemptItem } from './types';
import { AttemptStatusBadge } from './AttemptStatusBadge';
import { formatCurrency, formatDateTime } from '@/data/mock-manager-data';

export function RecentAttemptsTable({ items }: { items: AttemptItem[] }) {
  if (items.length === 0) {
    return <p className="px-5 py-8 text-center text-xs text-muted-ink">No recent attempts found.</p>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink border-b border-line">
        <tr>
          <th className="px-5 py-3">Reference</th>
          <th className="px-5 py-3">Vendor</th>
          <th className="px-5 py-3 text-right">Amount</th>
          <th className="px-5 py-3">Outcome</th>
          <th className="px-5 py-3">Provider Ref</th>
          <th className="px-5 py-3">Initiated</th>
          <th className="px-5 py-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line text-ink">
        {items.map((item) => (
          <tr key={item.id} className="transition hover:bg-canvas/50">
            <td className="whitespace-nowrap px-5 py-3.5"><Link href={`/finance/requests/${item.paymentRequestId}`} className="text-[13px] font-semibold text-brand hover:underline">{item.reference}</Link></td>
            <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink">{item.vendorName}</td>
            <td className="whitespace-nowrap px-5 py-3.5 text-right  font-semibold tabular-nums text-ink">{formatCurrency(item.amount)}</td>
            <td className="whitespace-nowrap px-5 py-3.5"><AttemptStatusBadge status={item.status} /></td>
            <td className="whitespace-nowrap px-5 py-3.5  text-xs text-muted-ink">{item.providerReference || '—'}</td>
            <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">{formatDateTime(item.startedAt)}</td>
            <td className="whitespace-nowrap px-5 py-3.5 text-right">
              <Link href="/finance/reconciliation" className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink hover:bg-canvas transition shadow-2xs">
                <Eye className="size-3 text-muted-ink" /><span>Reconciliation</span>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
