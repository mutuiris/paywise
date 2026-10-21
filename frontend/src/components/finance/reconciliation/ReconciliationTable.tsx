import React from 'react';
import { PaymentAttempt } from './types';
import { ReconciliationRow } from './ReconciliationRow';

interface Props {
  items: PaymentAttempt[];
  verifyingId: string | null;
  onVerify: (id: string) => void;
}

export function ReconciliationTable({ items, verifyingId, onVerify }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
          <tr>
            <th className="px-5 py-3">Request</th>
            <th className="px-5 py-3">Vendor</th>
            <th className="px-5 py-3 text-right">Amount</th>
            <th className="px-5 py-3">Outcome</th>
            <th className="px-5 py-3">Provider Ref</th>
            <th className="px-5 py-3">Started</th>
            <th className="px-5 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line text-ink">
          {items.map((item) => (
            <ReconciliationRow
              key={item.id}
              item={item}
              isVerifying={verifyingId === item.id}
              onVerify={onVerify}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
