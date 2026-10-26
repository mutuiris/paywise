'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { FailedItem } from './types';
import { formatCurrency } from '@/data/mock-manager-data';

export function FailedAttemptsTable({ items }: { items: FailedItem[] }) {
  if (items.length === 0) {
    return <p className="px-5 py-8 text-center text-xs text-muted-ink">No failed payments recorded.</p>;
  }

  return (
    <table className="w-full text-left text-sm font-serif">
      <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink border-b border-line">
        <tr>
          <th className="px-5 py-3">Reference</th>
          <th className="px-5 py-3">Vendor</th>
          <th className="px-5 py-3 text-right">Amount</th>
          <th className="px-5 py-3">Method</th>
          <th className="px-5 py-3">Failure Reason</th>
          <th className="px-5 py-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line text-ink">
        {items.map((f) => (
          <tr key={f.id} className="transition hover:bg-canvas/50">
            <td className="whitespace-nowrap px-5 py-3.5">
              <Link href={`/finance/requests/${f.id}`} className="font-serif text-[13px] font-semibold text-err hover:underline">
                {f.reference}
              </Link>
            </td>
            <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink">{f.vendorName}</td>
            <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">{formatCurrency(f.amount)}</td>
            <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">{f.paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank Transfer'}</td>
            <td className="whitespace-nowrap px-5 py-3.5 text-xs text-err font-medium">{f.failureReason}</td>
            <td className="whitespace-nowrap px-5 py-3.5 text-right">
              <Link href="/finance/payments" className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:bg-canvas transition">
                <RotateCcw className="size-3" /><span>Review</span>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
