import React from 'react';
import { RefreshCw } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/data/mock-manager-data';
import { PaymentAttempt } from './types';
import { ReconciliationOutcomeBadge } from './ReconciliationOutcomeBadge';

interface Props {
  item: PaymentAttempt;
  isVerifying: boolean;
  onVerify: (id: string) => void;
}

export function ReconciliationRow({ item, isVerifying, onVerify }: Props) {
  return (
    <tr className="transition hover:bg-canvas/50">
      <td className="whitespace-nowrap px-5 py-4 font-serif text-[13px] font-semibold text-brand-deep">
        {item.reference}
      </td>
      <td className="px-5 py-4">
        <span className="font-medium text-ink">{item.vendorName}</span>
        {item.note && <p className="mt-0.5 text-[11px] text-muted-ink">{item.note}</p>}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-right font-serif font-semibold tabular-nums text-ink">
        {formatCurrency(item.amount)}
      </td>
      <td className="px-5 py-4">
        <ReconciliationOutcomeBadge status={item.status} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 font-serif text-xs text-muted-ink">
        {item.providerReference || '—'}
      </td>
      <td className="px-5 py-4 text-xs text-muted-ink">{formatDateTime(item.startedAt)}</td>
      <td className="px-5 py-4 text-right">
        {item.status === 'AMBIGUOUS' ? (
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => onVerify(item.id)}
            className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`size-3 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Checking…' : 'Re-try'}</span>
          </button>
        ) : (
          <span className="text-xs text-muted-ink">Settled</span>
        )}
      </td>
    </tr>
  );
}
