'use client';

import React, { useState } from 'react';
import { Banknote, AlertTriangle, RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/data/mock-manager-data';
import { PaymentExecutionModal } from './PaymentExecutionModal';

export interface PaymentItem {
  id: string;
  reference: string;
  vendorName: string;
  amount: number;
  invoiceNumber: string;
  paymentMethod: 'MPESA' | 'BANK_TRANSFER';
  accountDetails: string;
  status: 'READY' | 'FAILED' | 'PAID';
  failureReason?: string;
}

const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: 'pr4',
    reference: 'PR-000126',
    vendorName: 'PowerHire Kenya',
    amount: 42000,
    invoiceNumber: 'PH-912',
    paymentMethod: 'MPESA',
    accountDetails: 'M-Pesa Paybill 247247 (Acct: POWHIRE-99)',
    status: 'READY',
  },
  {
    id: 'pr5',
    reference: 'PR-000127',
    vendorName: 'Prime Cement Supplies',
    amount: 96500,
    invoiceNumber: 'PC-5510',
    paymentMethod: 'BANK_TRANSFER',
    accountDetails: 'Equity Bank · 0110298374100',
    status: 'READY',
  },
  {
    id: 'pr9',
    reference: 'PR-000131',
    vendorName: 'Apex Electricals',
    amount: 73900,
    invoiceNumber: 'AE-4088',
    paymentMethod: 'BANK_TRANSFER',
    accountDetails: 'Standard Chartered · 0100293847500',
    status: 'FAILED',
    failureReason: 'Provider gateway timeout on settlement bridge',
  },
];

export function PaymentProcessingView() {
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
      setPayments((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: 'PAID' } : p))
      );
      setIsProcessing(false);
      setSuccessRef(generatedRef);
    }, 1500);
  };

  const handleRetry = (item: PaymentItem) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === item.id ? { ...p, status: 'READY', failureReason: undefined } : p
      )
    );
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Payment Processing
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Initiate disbursements through simulated mock gateways (M-Pesa B2C / Bank RTGS).
        </p>
      </div>

      {/* Ready Queue Table */}
      <div className="rounded-xl border border-line bg-surface shadow-2xs">
        <div className="border-b border-line p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">
                Ready for Payout ({readyItems.length})
              </h2>
              <p className="text-xs text-muted-ink">
                Dual authorizations complete. Ready to trigger funds transfer.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Mock Gateway Ready
            </span>
          </div>
        </div>

        {readyItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-ink">
            No payments waiting for payout trigger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
                <tr>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {readyItems.map((item) => (
                  <tr key={item.id} className="transition hover:bg-canvas/50">
                    <td className="whitespace-nowrap px-5 py-4 font-serif text-[13px] font-semibold text-brand-deep">
                      {item.reference}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-ink">
                      {item.vendorName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-serif text-xs text-muted-ink">
                      {item.invoiceNumber}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-serif font-semibold tabular-nums text-ink">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-ink">
                      <span className="font-semibold text-ink">
                        {item.paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank Wire'}
                      </span>
                      <div className="text-[11px]">{item.accountDetails}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleExecute(item)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 cursor-pointer transition"
                      >
                        <Banknote className="size-3.5" />
                        <span>Disburse Now</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Failed Queue Table */}
      {failedItems.length > 0 && (
        <div className="rounded-xl border border-line bg-surface shadow-2xs">
          <div className="border-b border-line p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-err" />
              <h2 className="text-base font-bold text-ink">
                Failed Attempts ({failedItems.length})
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
                <tr>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {failedItems.map((item) => (
                  <tr key={item.id} className="transition hover:bg-canvas/50">
                    <td className="whitespace-nowrap px-5 py-4 font-serif text-[13px] font-semibold text-err">
                      {item.reference}
                    </td>
                    <td className="px-5 py-4 font-medium text-ink">
                      {item.vendorName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-serif font-semibold tabular-nums text-ink">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-5 py-4 text-xs text-err">
                      {item.failureReason}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRetry(item)}
                        className="inline-flex items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas cursor-pointer transition"
                      >
                        <RotateCcw className="size-3" />
                        <span>Move to Ready</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Execution Modal */}
      <PaymentExecutionModal
        isOpen={!!activeItem}
        isProcessing={isProcessing}
        vendorName={activeItem?.vendorName || ''}
        reference={activeItem?.reference || ''}
        amount={activeItem?.amount || 0}
        successProviderRef={successRef}
        onClose={() => setActiveItem(null)}
      />
    </div>
  );
}
