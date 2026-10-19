import { useState, useEffect } from 'react';
import { PaymentItem } from './types';
import { INITIAL_PAYMENTS } from './mockData';
import { paymentService, reportingService } from '@/lib/api/services';

export function usePaymentProcessing() {
  const [payments, setPayments] = useState<PaymentItem[]>(INITIAL_PAYMENTS);
  const [activeItem, setActiveItem] = useState<PaymentItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let ignore = false;

    Promise.allSettled([
      paymentService.listRequests({ status: 'APPROVED' }),
      reportingService.getFailedPayments(),
    ]).then(([approvedRes, failedRes]) => {
      if (ignore) return;
      const items: PaymentItem[] = [];

      if (approvedRes.status === 'fulfilled' && approvedRes.value?.results) {
        approvedRes.value.results.forEach((r) => {
          items.push({
            id: r.id,
            reference: r.invoice_number || `PR-${r.id.slice(0, 6).toUpperCase()}`,
            vendorName: r.vendor_name || 'Designated Vendor',
            amount: parseFloat(r.amount) || 0,
            invoiceNumber: r.invoice_number || `INV-${r.id.slice(0, 6).toUpperCase()}`,
            paymentMethod: r.payment_method === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
            accountDetails: r.payment_method === 'BANK' ? 'Standard Chartered •••• 4092' : '+254 712 345 678',
            status: 'READY',
          });
        });
      }

      if (failedRes.status === 'fulfilled' && failedRes.value?.results) {
        failedRes.value.results.forEach((f) => {
          items.push({
            id: f.id,
            reference: f.invoice_number,
            vendorName: f.vendor_name || 'Designated Vendor',
            amount: parseFloat(f.amount) || 0,
            invoiceNumber: f.invoice_number,
            paymentMethod: f.payment_method === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
            accountDetails: f.payment_method === 'BANK' ? 'Standard Chartered •••• 4092' : '+254 712 345 678',
            status: 'FAILED',
            failureReason: f.failure_reason,
          });
        });
      }

      if (items.length > 0) {
        setPayments(items);
        setUsingFallback(false);
      } else {
        setUsingFallback(true);
      }
    }).catch(() => {
      if (!ignore) setUsingFallback(true);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const readyItems = payments.filter((p) => p.status === 'READY');
  const failedItems = payments.filter((p) => p.status === 'FAILED');

  const handleExecute = (item: PaymentItem) => {
    setActiveItem(item);
    setIsProcessing(true);
    setSuccessRef(null);
    setTimeout(() => {
      const generatedRef = `MOCK-PAY-${Math.floor(89000 + Math.random() * 1000)}`;
      setPayments((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: 'PAID' } : p)));
      setIsProcessing(false);
      setSuccessRef(generatedRef);
    }, 1200);
  };

  const handleRetry = (item: PaymentItem) => {
    handleExecute(item);
  };

  const refreshData = () => {
    Promise.allSettled([
      paymentService.listRequests({ status: 'APPROVED' }),
      reportingService.getFailedPayments(),
    ]).then(([approvedRes, failedRes]) => {
      const items: PaymentItem[] = [];

      if (approvedRes.status === 'fulfilled' && approvedRes.value?.results) {
        approvedRes.value.results.forEach((r) => {
          items.push({
            id: r.id,
            reference: r.invoice_number || `PR-${r.id.slice(0, 6).toUpperCase()}`,
            vendorName: r.vendor_name || 'Designated Vendor',
            amount: parseFloat(r.amount) || 0,
            invoiceNumber: r.invoice_number || `INV-${r.id.slice(0, 6).toUpperCase()}`,
            paymentMethod: r.payment_method === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
            accountDetails: r.payment_method === 'BANK' ? 'Standard Chartered •••• 4092' : '+254 712 345 678',
            status: 'READY',
          });
        });
      }

      if (failedRes.status === 'fulfilled' && failedRes.value?.results) {
        failedRes.value.results.forEach((f) => {
          items.push({
            id: f.id,
            reference: f.invoice_number,
            vendorName: f.vendor_name || 'Designated Vendor',
            amount: parseFloat(f.amount) || 0,
            invoiceNumber: f.invoice_number,
            paymentMethod: f.payment_method === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
            accountDetails: f.payment_method === 'BANK' ? 'Standard Chartered •••• 4092' : '+254 712 345 678',
            status: 'FAILED',
            failureReason: f.failure_reason,
          });
        });
      }

      if (items.length > 0) {
        setPayments(items);
        setUsingFallback(false);
      }
    });
  };

  return {
    readyItems,
    failedItems,
    activeItem,
    isProcessing,
    successRef,
    usingFallback,
    handleExecute,
    handleRetry,
    refreshData,
    closeModal: () => setActiveItem(null),
  };
}
