'use client';

import React from 'react';
import { PaymentItem } from './types';
import { PaymentHeader } from './PaymentHeader';
import { PaymentReadyTable } from './PaymentReadyTable';
import { PaymentFailedTable } from './PaymentFailedTable';
import { PaymentExecutionModal } from './PaymentExecutionModal';
import { usePaymentProcessing } from './usePaymentProcessing';

export type { PaymentItem };

export function PaymentProcessingView() {
  const {
    readyItems,
    failedItems,
    activeItem,
    isProcessing,
    successRef,
    handleExecute,
    handleRetry,
    closeModal,
  } = usePaymentProcessing();

  return (
    <div className="space-y-6">
      <PaymentHeader />
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
