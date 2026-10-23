/**
 * Core API and Data Contracts for PayWise
 * Conforming strictly to backend Django models and Handoff Document Section 8.
 */

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'FINANCE' | 'ADMIN';
export type BackendUserRole = 'EMPLOYEE' | 'MANAGER' | 'FINANCE_OFFICER' | 'ADMINISTRATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  approvalLimit?: number;
}

export type PaymentMethod = 'MPESA' | 'BANK';

export interface Vendor {
  id: string;
  name: string;
  service: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  payoutMethod: PaymentMethod;
  bankName?: string;
  accountNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  department: string;
  siteLocation: string;
  isActive: boolean;
}

export type PaymentRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PROCESSING'
  | 'PAID'
  | 'REJECTED'
  | 'FAILED';

export interface ApprovalRecord {
  id: string;
  type: 'MANAGER' | 'FINANCE';
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverId?: string;
  approverName?: string;
  decidedAt?: string;
  reason?: string;
}

export interface PaymentRequest {
  id: string;
  reference: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  currency: 'KES';
  invoiceNumber: string;
  project: string;
  requesterId: string;
  requesterName: string;
  paymentMethod: PaymentMethod;
  reason: string;
  notes?: string;
  status: PaymentRequestStatus;
  approvals?: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
}

export type AttemptStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'AMBIGUOUS';

export interface PaymentAttempt {
  id: string;
  paymentRequestId: string;
  status: AttemptStatus;
  providerReference?: string;
  amount: number;
  currency: 'KES';
  paymentMethod: PaymentMethod;
  failureReason?: string;
  startedAt: string;
  completedAt?: string;
}

export interface AuditEventDTO {
  id: string;
  actorEmail: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ApiErrorEnvelope {
  detail?: string;
  message?: string;
  code?: string;
  fields?: Record<string, string[]>;
}
