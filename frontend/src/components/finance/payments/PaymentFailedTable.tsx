import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PaymentItem } from './types';
import { PaymentFailedRow } from './PaymentFailedRow';

interface Props {
  items: PaymentItem[];
  onRetry: (item: PaymentItem) => void;
}

export function PaymentFailedTable({ items, onRetry }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-line bg-surface shadow-2xs">
      <div className="border-b border-line p-5 flex items-center gap-2">
        <AlertTriangle className="size-4 text-err" />
        <h2 className="text-base font-bold text-ink">Failed Attempts ({items.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
            <tr>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Vendor</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3">Reason</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            {items.map((item) => (
              <PaymentFailedRow key={item.id} item={item} onRetry={onRetry} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
