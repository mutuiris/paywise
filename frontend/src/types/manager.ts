export type PaymentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PROCESSING'
  | 'PAID'
  | 'REJECTED'
  | 'FAILED';

export type PaymentMethod = 'MPESA' | 'BANK_TRANSFER';

export type ApprovalStepType = 'MANAGER' | 'FINANCE';

export interface ApprovalStep {
  id: string;
  type: ApprovalStepType;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverId?: string;
  approverName?: string;
  decidedAt?: string;
  reason?: string;
}

export interface PaymentRequestItem {
  id: string;
  reference: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  reason: string;
  project: string;
  paymentMethod: PaymentMethod;
  requestedPaymentDate: string;
  notes: string;
  requesterId: string;
  requesterName: string;
  status: PaymentStatus;
  createdAt: string;
  submittedAt?: string;
  updatedAt: string;
  approvals?: ApprovalStep[];
}

export interface ActivityEvent {
  id: string;
  at: string;
  actorName: string;
  action: string;
  entity: string;
  requestReference: string;
  description: string;
}

export interface SummaryMetric {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'neutral' | 'ok' | 'warn' | 'err' | 'brand';
}
