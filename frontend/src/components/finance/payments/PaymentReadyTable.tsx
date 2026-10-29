import React from 'react';
import { PaymentItem } from './types';
import { PaymentReadyRow } from './PaymentReadyRow';

interface Props {
  items: PaymentItem[];
  onExecute: (item: PaymentItem) => void;
}

export function PaymentReadyTable({ items, onExecute }: Props) {
  return (
    <div className="rounded-xl border border-line bg-surface shadow-2xs">
      <div className="border-b border-line p-5">
        <h2 className="text-base font-bold text-ink">Ready for Payout ({items.length})</h2>
        <p className="text-xs text-muted-ink">Dual authorizations complete. Ready for transfer.</p>
      </div>
      {items.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-ink">No payments waiting for payout trigger.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Destination</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {items.map((item) => (
                <PaymentReadyRow key={item.id} item={item} onExecute={onExecute} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
