export type DashboardTableTab = 'RECENT' | 'QUEUE' | 'FAILED';

export interface QueueItem {
  id: string;
  reference: string;
  vendorName: string;
  amount: number;
  invoiceNumber: string;
  paymentMethod: 'MPESA' | 'BANK_TRANSFER';
  accountDetails: string;
}

export interface AttemptItem {
  id: string;
  paymentRequestId: string;
  reference: string;
  vendorName: string;
  amount: number;
  status: 'SUCCEEDED' | 'FAILED' | 'AMBIGUOUS' | 'PROCESSING';
  startedAt: string;
  providerReference?: string;
}

export interface FailedItem {
  id: string;
  reference: string;
  vendorName: string;
  amount: number;
  paymentMethod: 'MPESA' | 'BANK_TRANSFER';
  failureReason: string;
}
