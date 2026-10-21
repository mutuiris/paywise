'use client';

import React from 'react';
import { PaymentItem } from './types';
import { PaymentHeader } from './PaymentHeader';
import { PaymentReadyTable } from './PaymentReadyTable';
import { PaymentFailedTable } from './PaymentFailedTable';
import { PaymentExecutionModal } from './PaymentExecutionModal';
import { usePaymentProcessing } from './usePaymentProcessing';

import { AlertCircle, RefreshCw, ShieldAlert } from 'lucide-react';

export type { PaymentItem };

export function PaymentProcessingView() {
  const {
    readyItems,
    failedItems,
    activeItem,
    isProcessing,
    successRef,
    usingFallback,
    handleExecute,
    handleRetry,
    refreshData,
    closeModal,
  } = usePaymentProcessing();

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PaymentHeader />
        <button
          type="button"
          onClick={refreshData}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition shadow-2xs"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh Requisitions</span>
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/80 p-4 text-xs text-sky-950 shadow-2xs">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-sky-600" />
        <div className="space-y-0.5">
          <p className="font-semibold text-sky-900">Mock Payment Provider Active</p>
          <p className="text-sky-800">
            Disbursements run through simulated sandbox gateways (M-Pesa B2C &amp; Bank RTGS/EFT). Real monetary settlement contracts are mocked in compliance with product specifications.
          </p>
        </div>
      </div>

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>No live approved requests found on backend. Displaying demonstration pipeline items.</span>
        </div>
      )}

      <PaymentReadyTable items={readyItems} onExecute={handleExecute} />
      <PaymentFailedTable items={failedItems} onRetry={handleRetry} />
      <PaymentExecutionModal
        isOpen={!!activeItem}
        isProcessing={isProcessing}
        vendorName={activeItem?.vendorName || ''}
        reference={activeItem?.reference || ''}
        amount={activeItem?.amount || 0}
        successProviderRef={successRef}
        onClose={closeModal}
      />
    </div>
  );
}
