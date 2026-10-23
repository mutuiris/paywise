import React from 'react';
import { RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/data/mock-manager-data';
import { PaymentItem } from './types';

interface Props {
  item: PaymentItem;
  onRetry: (item: PaymentItem) => void;
}

export function PaymentFailedRow({ item, onRetry }: Props) {
  return (
    <tr className="transition hover:bg-canvas/50">
      <td className="whitespace-nowrap px-5 py-4 font-serif text-[13px] font-semibold text-err">
        {item.reference}
      </td>
      <td className="px-5 py-4 font-medium text-ink">{item.vendorName}</td>
      <td className="whitespace-nowrap px-5 py-4 text-right font-serif font-semibold tabular-nums text-ink">
        {formatCurrency(item.amount)}
      </td>
      <td className="px-5 py-4 text-xs text-err">{item.failureReason}</td>
      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => onRetry(item)}
          className="inline-flex items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas cursor-pointer transition"
        >
          <RotateCcw className="size-3" />
          <span>Move to Ready</span>
        </button>
      </td>
    </tr>
  );
}
