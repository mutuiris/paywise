'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';
import { formatCurrency, getApprovalRoute } from '@/data/mock-manager-data';

interface AmountRoutingSectionProps {
  amount: string;
  error?: string;
  onAmountChange: (val: string) => void;
}

export function AmountRoutingSection({
  amount,
  error,
  onAmountChange,
}: AmountRoutingSectionProps) {
  const numericAmount = parseFloat(amount) || 0;
  const route = getApprovalRoute(numericAmount);

  return (
    <div>
      <h2 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-line pb-2 flex items-center gap-2">
        <CreditCard className="size-4 text-brand" />
        <span>2. Payable Amount & Policy Routing</span>
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Amount */}
        <div>
          <label htmlFor="amount-input" className="block text-xs font-semibold text-ink">
            Requested Amount (KES) <span className="text-err">*</span>
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-serif text-sm font-semibold text-muted-ink">
              KES
            </span>
            <input
              id="amount-input"
              type="number"
              step="100"
              min="1"
              placeholder="0.00"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className={`w-full rounded-md border bg-surface py-2 pl-12 pr-3 font-serif text-lg font-semibold text-ink placeholder:text-muted-ink focus:outline-none focus:ring-2 ${
                error
                  ? 'border-err focus:border-err focus:ring-err/20'
                  : 'border-line focus:border-brand focus:ring-brand/20'
              }`}
            />
          </div>
          {error && <p className="mt-1 text-xs text-err font-medium">{error}</p>}
          {numericAmount > 0 && (
            <p className="mt-1 text-xs text-brand font-semibold font-serif">
              {formatCurrency(numericAmount)}
            </p>
          )}
        </div>

        {/* Live Routing Preview Card */}
        <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-ink uppercase tracking-wider">
              Required Approval Chain
            </span>
            <span
              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                route.isDual
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {route.label}
            </span>
          </div>
          <p className="text-xs text-muted-ink">
            {numericAmount > 50000 ? (
              <>
                Amounts above <strong className="text-ink">KES 50,000</strong> require{' '}
                <strong className="text-ink">Step 1: Manager</strong> review, followed by{' '}
                <strong className="text-ink">Step 2: Finance Officer</strong> authorization
                before disbursement.
              </>
            ) : (
              <>
                Amounts up to <strong className="text-ink">KES 50,000</strong> are within
                managerial sign-off threshold and proceed directly to payment release upon
                manager approval.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
