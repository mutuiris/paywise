import { PaymentItem } from './types';

export const INITIAL_PAYMENTS: PaymentItem[] = [
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
