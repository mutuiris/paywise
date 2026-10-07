export type PaymentStatus =
  | 'PENDING_MANAGER'
  | 'PENDING_FINANCE'
  | 'APPROVED'
  | 'PAID'
  | 'REJECTED';

export interface PaymentRequest {
  id: string;
  vendor: string;
  category: string;
  amount: string;
  rawAmount: number;
  date: string;
  status: PaymentStatus;
  invoiceNumber: string;
  description: string;
}

export interface MetricStat {
  title: string;
  value: string;
  change: string;
  type: 'neutral' | 'warn' | 'ok' | 'err';
}
