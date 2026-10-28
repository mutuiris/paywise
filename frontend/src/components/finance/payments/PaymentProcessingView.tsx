'use client';

import React from 'react';
import { PaymentItem } from './types';
import { PaymentHeader } from './PaymentHeader';
import { PaymentReadyTable } from './PaymentReadyTable';
import { PaymentFailedTable } from './PaymentFailedTable';
import { PaymentExecutionModal } from './PaymentExecutionModal';
import { usePaymentProcessing } from './usePaymentProcessing';

import { AlertCircle, RefreshCw } from 'lucide-react';

export type { PaymentItem };

export function PaymentProcessingView() {
  const {
    readyItems,
    failedItems,
    activeItem,
    isProcessing,
    successRef,
    error,
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


      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>{error}</span>
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
