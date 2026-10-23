export type UUID = string;

export type UserRole =
  | 'EMPLOYEE'
  | 'MANAGER'
  | 'FINANCE_OFFICER'
  | 'ADMINISTRATOR';

export interface User {
  id: UUID;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface Vendor {
  id: UUID;
  name: string;
  service_category: string;
  email: string;
  phone_number: string;
  payment_details: Record<string, unknown>;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: UUID | null;
  updated_by: UUID | null;
}

export interface Project {
  id: UUID;
  name: string;
  code: string | null;
  department: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: UUID | null;
  updated_by: UUID | null;
}

export type PaymentRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED';

export type PaymentMethod = 'MPESA' | 'BANK_TRANSFER' | 'OTHER';

export interface PaymentRequest {
  id: UUID;
  vendor_id: UUID;
  vendor_name: string | null;
  project_id: UUID | null;
  project_name: string | null;
  requester_id: UUID | null;
  requester_username: string | null;
  amount: string;
  currency: string;
  invoice_number: string;
  description: string;
  payment_method: PaymentMethod;
  status: PaymentRequestStatus;
  rejection_reason: string;
  supporting_notes: string;
  created_at: string;
  updated_at: string;
}

export type ApprovalTier = 'MANAGER' | 'FINANCE';

export type ApprovalDecision = 'APPROVED' | 'REJECTED';

export interface Approval {
  id: UUID;
  payment_request: UUID;
  approver: UUID;
  approver_name?: string;
  tier: ApprovalTier;
  decision: ApprovalDecision;
  reason: string;
  created_at: string;
  updated_at: string;
}

export type PaymentAttemptStatus =
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'AMBIGUOUS';

export interface PaymentAttempt {
  id: UUID;
  payment_request: UUID;
  status: PaymentAttemptStatus;
  provider_reference: string;
  amount: string;
  currency: string;
  payment_method: string;
  failure_reason: string;
  created_at: string;
  updated_at: string;
}

export type AuditAction =
  | 'PAYMENT_REQUEST_CREATED'
  | 'PAYMENT_REQUEST_SUBMITTED'
  | 'PAYMENT_REQUEST_APPROVED'
  | 'PAYMENT_REQUEST_REJECTED'
  | 'PAYMENT_PROCESSING_STARTED'
  | 'PAYMENT_COMPLETED'
  | 'PAYMENT_FAILED'
  | 'APPROVAL_INVALIDATED'
  | 'VENDOR_CREATED'
  | 'PROJECT_CREATED'
  | 'USER_ROLE_CHANGED';

export interface AuditEvent {
  id: UUID;
  actor: UUID | null;
  actor_email: string;
  action: AuditAction | string;
  entity_type: string;
  entity_id: UUID;
  description: string;
  created_at: string;
}
