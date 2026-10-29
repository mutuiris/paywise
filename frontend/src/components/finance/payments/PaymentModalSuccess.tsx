import React from 'react';
import { Check } from 'lucide-react';
import { formatCurrency } from '@/data/mock-manager-data';

interface Props {
  reference: string;
  amount: number;
  successProviderRef: string;
  onClose: () => void;
}

export function PaymentModalSuccess({ reference, amount, successProviderRef, onClose }: Props) {
  return (
    <div className="text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="size-6" />
      </span>
      <h3 className="mt-3 text-lg font-bold text-ink">Disbursement Succeeded!</h3>
      <p className="mt-1 text-xs text-muted-ink">Payment for {reference} was confirmed on provider ledger.</p>
      <div className="mt-4 rounded-lg bg-canvas p-3.5 text-left space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-ink">Provider Reference:</span>
          <span className="font-serif text-xs font-semibold text-ink">{successProviderRef}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-ink">Disbursed Amount:</span>
          <span className="font-serif font-semibold tabular-nums text-ink">{formatCurrency(amount)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-ink">Status:</span>
          <span className="font-semibold text-emerald-600">Settled (Instant / RTGS)</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full rounded-md bg-brand py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer"
      >
        Done
      </button>
    </div>
  );
}
