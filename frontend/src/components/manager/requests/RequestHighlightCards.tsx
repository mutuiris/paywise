import React from 'react';
import { CreditCard } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import { formatCurrency, getApprovalRoute } from '@/data/mock-manager-data';

interface RequestHighlightCardsProps {
  request: PaymentRequestItem;
}

export function RequestHighlightCards({ request }: RequestHighlightCardsProps) {
  const route = getApprovalRoute(request.amount);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-line bg-surface p-4 shadow-2xs hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer">
        <span className="text-sm font-semibold text-ink font-serif tracking-tight block">
          Payable Amount
        </span>
        <span className="font-serif text-lg sm:text-xl font-bold tabular-nums text-ink mt-1 block">
          {formatCurrency(request.amount)}
        </span>
        <span className="text-[11px] text-muted-ink font-serif mt-0.5 block">
          {request.currency} Currency
        </span>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4 shadow-2xs hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer">
        <span className="text-sm font-semibold text-ink font-serif tracking-tight block">
          Vendor / Payee
        </span>
        <span className="text-base font-semibold text-ink mt-1 truncate block">
          {request.vendorName}
        </span>
        <span className="text-[11px] font-serif text-muted-ink mt-0.5 block">
          INV: {request.invoiceNumber}
        </span>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4 shadow-2xs hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer">
        <span className="text-sm font-semibold text-ink font-serif tracking-tight block">
          Disbursement Channel
        </span>
        <span className="text-base font-semibold text-ink mt-1 flex items-center gap-1.5">
          <CreditCard className="size-4 text-brand" />
          <span>{request.paymentMethod === 'MPESA' ? 'M-Pesa Payout' : 'Bank'}</span>
        </span>
        <span className="text-[11px] text-muted-ink font-serif mt-0.5 block">
          Direct settlement
        </span>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4 shadow-2xs hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer">
        <span className="text-sm font-semibold text-ink font-serif tracking-tight block">
          Approval Routing
        </span>
        <span className="text-xs font-semibold text-brand mt-1 block">
          {route.label}
        </span>
        <span className="text-[11px] text-muted-ink font-serif mt-0.5 block">
          {route.isDual ? 'Threshold > 50,000' : 'Threshold ≤ 50,000'}
        </span>
      </div>
    </div>
  );
}
