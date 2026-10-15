import React from 'react';
import { Banknote } from 'lucide-react';
import { formatCurrency } from '@/data/mock-manager-data';
import { PaymentItem } from './types';

interface Props {
  item: PaymentItem;
  onExecute: (item: PaymentItem) => void;
}

export function PaymentReadyRow({ item, onExecute }: Props) {
  return (
    <tr className="transition hover:bg-canvas/50">
      <td className="whitespace-nowrap px-5 py-4  text-[13px] font-semibold text-brand-deep">
        {item.reference}
      </td>
      <td className="whitespace-nowrap px-5 py-4 font-medium text-ink">
        {item.vendorName}
      </td>
      <td className="whitespace-nowrap px-5 py-4  text-xs text-muted-ink">
        {item.invoiceNumber}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-right  font-semibold tabular-nums text-ink">
        {formatCurrency(item.amount)}
      </td>
      <td className="px-5 py-4 text-xs text-muted-ink">
        <span className="font-semibold text-ink">
          {item.paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank Wire'}
        </span>
        <div className="text-[11px]">{item.accountDetails}</div>
      </td>
      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => onExecute(item)}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 cursor-pointer transition"
        >
          <Banknote className="size-3.5" />
          <span>Disburse Now</span>
        </button>
      </td>
    </tr>
  );
}
