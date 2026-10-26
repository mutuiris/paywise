'use client';

import React from 'react';
import { PaymentExecutionModalProps } from './types';
import { PaymentModalProcessing } from './PaymentModalProcessing';
import { PaymentModalSuccess } from './PaymentModalSuccess';

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
        {isProcessing && (
          <PaymentModalProcessing vendorName={vendorName} amount={amount} />
        )}
        {!isProcessing && successProviderRef && (
          <PaymentModalSuccess
            reference={reference}
            amount={amount}
            successProviderRef={successProviderRef}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
