export interface PaymentAttempt {
  id: string;
  reference: string;
  vendorName: string;
  amount: number;
  status: 'SUCCEEDED' | 'FAILED' | 'AMBIGUOUS';
  providerReference?: string;
  startedAt: string;
  note?: string;
}
