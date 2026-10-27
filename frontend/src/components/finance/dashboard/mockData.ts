import { QueueItem, AttemptItem, FailedItem } from './types';

export const QUEUE_ITEMS: QueueItem[] = [
  { id: 'pr4', reference: 'PR-000126', vendorName: 'PowerHire Kenya', amount: 42000, paymentMethod: 'MPESA', invoiceNumber: 'PH-912', accountDetails: 'M-Pesa Paybill 247247' },
  { id: 'pr5', reference: 'PR-000127', vendorName: 'Prime Cement Supplies', amount: 96500, paymentMethod: 'BANK_TRANSFER', invoiceNumber: 'PC-5510', accountDetails: 'Equity Bank · 0110298374100' },
];

export const ATTEMPT_ITEMS: AttemptItem[] = [
  { id: 'at1', paymentRequestId: 'pr6', reference: 'PR-000128', vendorName: 'BlueLine Plumbing', amount: 31200, status: 'SUCCEEDED', startedAt: '2026-09-30T13:58:00Z', providerReference: 'PAY-89201' },
  { id: 'at2', paymentRequestId: 'pr7', reference: 'PR-000129', vendorName: 'Metro Hardware Ltd.', amount: 18750, status: 'SUCCEEDED', startedAt: '2026-09-28T10:14:00Z', providerReference: 'PAY-89202' },
  { id: 'at3', paymentRequestId: 'pr8', reference: 'PR-000130', vendorName: 'SwiftHaul Logistics', amount: 54300, status: 'SUCCEEDED', startedAt: '2026-09-25T16:20:00Z', providerReference: 'PAY-89203' },
];

export const FAILED_ITEMS: FailedItem[] = [
  { id: 'pr9', reference: 'PR-000131', vendorName: 'Apex Electricals', amount: 73900, paymentMethod: 'BANK_TRANSFER', failureReason: 'Provider gateway timeout on settlement bridge' },
];
