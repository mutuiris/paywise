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
  rejectionReason?: string;
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

export interface VendorPaymentDetails {
  payout_method?: PaymentMethod | string;
  bank_name?: string;
  account_number?: string;
  mpesa_number?: string;
  paybill_number?: string;
  account_reference?: string;
  [key: string]: unknown;
}

export interface VendorDTO {
  id: string;
  name: string;
  service_category: string;
  email: string;
  phone_number: string;
  payment_details: VendorPaymentDetails | null;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  code: string;
  department: string;
  site_location?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface PaymentRequestDTO {
  id: string;
  vendor_id: string;
  vendor_name: string | null;
  project_id: string | null;
  project_name: string | null;
  requester_id: string | null;
  requester_username: string | null;
  amount: string;
  currency: 'KES';
  invoice_number: string;
  description: string;
  payment_method: PaymentMethod;
  status: PaymentRequestStatus;
  rejection_reason?: string | null;
  supporting_notes?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ApprovalRecordDTO {
  id: string;
  payment_request_id: string;
  approver_id: string;
  approver_name: string;
  tier: 'MANAGER' | 'FINANCE';
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string | null;
  created_at: string | null;
}

export interface ApprovalQueueItemDTO {
  id: string;
  invoice_number: string;
  amount: string;
  currency: string;
  status: PaymentRequestStatus;
  description: string;
  vendor_id: string;
  vendor_name: string | null;
  project_name: string | null;
  payment_method: string;
  requester_id: string | null;
  requester_name: string | null;
  required_tiers: string[];
  approved_tiers: string[];
  pending_tiers: string[];
  is_fully_approved: boolean;
  created_at: string | null;
}

export interface ApprovalDetailDTO extends ApprovalQueueItemDTO {
  history: ApprovalRecordDTO[];
  rejection_reason?: string | null;
}

export interface ActivitySummaryDTO {
  total_paid_amount: string;
  total_paid_count: number;
  awaiting_approval_count: number;
  awaiting_approval_amount: string;
  failed_payment_count: number;
  failed_payment_amount: string;
  total_requests_count: number;
  total_requested_amount: string;
  period: {
    date_from: string | null;
    date_to: string | null;
  };
}

export interface FailedPaymentItemDTO {
  id: string;
  invoice_number: string;
  amount: string;
  currency: string;
  vendor_id: string;
  vendor_name: string | null;
  project_id: string | null;
  project_name: string | null;
  requester_id: string | null;
  requester_username: string | null;
  payment_method: PaymentMethod;
  failure_reason: string;
  created_at: string | null;
}

export interface FailedPaymentsReportDTO {
  total_failed_amount: string;
  total_failed_count: number;
  results: FailedPaymentItemDTO[];
  period: {
    date_from: string | null;
    date_to: string | null;
  };
}

export interface ProjectSpendItemDTO {
  project_id: string;
  project_name: string;
  project_code: string;
  department: string;
  total_amount: string;
  paid_amount: string;
  pending_amount: string;
  total_count: number;
  paid_count: number;
  pending_count: number;
}

export interface ProjectBreakdownReportDTO {
  count: number;
  results: ProjectSpendItemDTO[];
  period: {
    date_from: string | null;
    date_to: string | null;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export interface AuditEventDTO {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor_id?: string | null;
  actor_email: string;
  actor_name?: string;
  description: string;
  metadata?: Record<string, unknown> | null;
  created_at: string | null;
}

export interface ApiErrorEnvelope {
  detail?: string;
  message?: string;
  error?: string;
  code?: string;
  fields?: Record<string, string[]>;
}

// Normalized responses that support both flat array operations (.map, .filter, etc.)
// AND wrapped envelope properties (.vendors, .results, .projects, .count)
export interface VendorListResponse extends Array<Vendor> {
  vendors: VendorDTO[];
  count: number;
}

export interface ProjectListResponse extends Array<Project> {
  projects: ProjectDTO[];
  count: number;
}

export interface PaymentRequestListResponse extends Array<PaymentRequest> {
  results: PaymentRequestDTO[];
  count: number;
}

export interface ApprovalQueueResponse extends Array<ApprovalQueueItemDTO> {
  results: ApprovalQueueItemDTO[];
  count: number;
}

export interface AuditEventListResponse extends Array<AuditEventDTO> {
  results: AuditEventDTO[];
  count: number;
}

export interface NormalizedVendorResponse extends Vendor {
  vendor: VendorDTO;
}

export interface NormalizedProjectResponse extends Project {
  project: ProjectDTO;
}

export interface NormalizedPaymentRequestResponse extends PaymentRequest {
  payment_request?: PaymentRequestDTO;
  vendor_id?: string;
  vendor_name?: string | null;
  project_id?: string | null;
  project_name?: string | null;
  requester_id?: string | null;
  requester_username?: string | null;
  invoice_number?: string;
  description?: string;
  payment_method?: PaymentMethod;
  rejection_reason?: string | null;
  supporting_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
