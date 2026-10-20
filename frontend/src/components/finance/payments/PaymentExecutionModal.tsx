'use client';

import React from 'react';
import { Loader2, Check } from 'lucide-react';
import { formatCurrency } from '@/data/mock-manager-data';

interface PaymentExecutionModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  vendorName: string;
  reference: string;
  amount: number;
  successProviderRef: string | null;
  onClose: () => void;
}

export function PaymentExecutionModal({
  isOpen,
  isProcessing,
  vendorName,
  reference,
  amount,
  successProviderRef,
  onClose,
}: PaymentExecutionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs font-serif">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-xl">
        {isProcessing ? (
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
        ) : successProviderRef ? (
          <div className="text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="size-6" />
            </span>
            <h3 className="mt-3 text-lg font-bold text-ink">
              Disbursement Succeeded!
            </h3>
            <p className="mt-1 text-xs text-muted-ink">
              Payment for {reference} was confirmed on provider ledger.
            </p>
            <div className="mt-4 rounded-lg bg-canvas p-3.5 text-left space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-ink">Provider Reference:</span>
                <span className="font-serif text-xs font-semibold text-ink">
                  {successProviderRef}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-ink">Disbursed Amount:</span>
                <span className="font-serif font-semibold tabular-nums text-ink">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-ink">Status:</span>
                <span className="font-semibold text-emerald-600">
                  Settled (Instant / RTGS)
                </span>
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
        ) : null}
      </div>
    </div>
  );
}
