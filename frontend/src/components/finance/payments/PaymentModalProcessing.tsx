import React from 'react';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/data/mock-manager-data';

interface Props {
  vendorName: string;
  amount: number;
}

export function PaymentModalProcessing({ vendorName, amount }: Props) {
  return (
    <div className="py-8 text-center">
      <Loader2 className="mx-auto size-10 animate-spin text-brand" />
      <h3 className="mt-4 text-base font-bold text-ink">
        Processing via Mock Settlement Gateway…
      </h3>
      <p className="mt-1 text-xs text-muted-ink">
        Transmitting disbursement payload for {vendorName}.
      </p>
      <p className="mt-3 font-serif text-xs font-semibold text-brand-deep">
        Amount: {formatCurrency(amount)}
      </p>
    </div>
  );
}
