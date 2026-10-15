'use client';

import React from 'react';
import Link from 'next/link';
import { Banknote } from 'lucide-react';
import { QueueItem } from './types';
import { formatCurrency } from '@/data/mock-manager-data';

export function PaymentQueueTable({ items }: { items: QueueItem[] }) {
  if (items.length === 0) {
    return <p className="px-5 py-8 text-center text-xs text-muted-ink">No approved payments queued.</p>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink border-b border-line">
        <tr>
          <th className="px-5 py-3">Reference</th>
          <th className="px-5 py-3">Vendor</th>
          <th className="px-5 py-3">Invoice</th>
          <th className="px-5 py-3 text-right">Amount</th>
          <th className="px-5 py-3">Payout Destination</th>
          <th className="px-5 py-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line text-ink">
        {items.map((row) => (
          <tr key={row.id} className="transition hover:bg-canvas/50">
            <td className="whitespace-nowrap px-5 py-3.5"><Link href={`/finance/requests/${row.id}`} className="text-[13px] font-semibold text-brand hover:underline">{row.reference}</Link></td>
            <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink">{row.vendorName}</td>
            <td className="whitespace-nowrap px-5 py-3.5  text-xs text-muted-ink">{row.invoiceNumber}</td>
            <td className="whitespace-nowrap px-5 py-3.5 text-right  font-semibold tabular-nums text-ink">{formatCurrency(row.amount)}</td>
            <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
              <span className="font-semibold text-ink">{row.paymentMethod === 'MPESA' ? 'M-Pesa B2C' : 'Bank Wire'}</span>
              <div className="text-[11px]">{row.accountDetails}</div>
            </td>
            <td className="whitespace-nowrap px-5 py-3.5 text-right">
              <Link href="/finance/payments" className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition">
                <Banknote className="size-3" /><span>Disburse</span>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
