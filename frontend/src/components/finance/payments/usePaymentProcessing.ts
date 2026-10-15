import { useState } from 'react';
import { PaymentItem } from './types';
import { INITIAL_PAYMENTS } from './mockData';

export function usePaymentProcessing() {
  const [payments, setPayments] = useState<PaymentItem[]>(INITIAL_PAYMENTS);
  const [activeItem, setActiveItem] = useState<PaymentItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const readyItems = payments.filter((p) => p.status === 'READY');
  const failedItems = payments.filter((p) => p.status === 'FAILED');

  const handleExecute = (item: PaymentItem) => {
    setActiveItem(item);
    setIsProcessing(true);
    setSuccessRef(null);
    setTimeout(() => {
      const generatedRef = `PAY-${Math.floor(89000 + Math.random() * 1000)}`;
      setPayments((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: 'PAID' } : p)));
      setIsProcessing(false);
      setSuccessRef(generatedRef);
    }, 1500);
  };

  const handleRetry = (item: PaymentItem) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: 'READY', failureReason: undefined } : p))
    );
  };

  return {
    readyItems,
    failedItems,
    activeItem,
    isProcessing,
    successRef,
    handleExecute,
    handleRetry,
    closeModal: () => setActiveItem(null),
  };
}
