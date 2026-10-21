import { apiClient } from './client';
import type { AccountIdentity } from '@/lib/auth/session';
import {
  VendorDTO,
  ProjectDTO,
  PaymentRequestDTO,
  ApprovalQueueItemDTO,
  ApprovalDetailDTO,
  AuditEventDTO,
  ActivitySummaryDTO,
  FailedPaymentsReportDTO,
  ProjectBreakdownReportDTO,
  PaginatedResponse,
} from './types';

export type { AccountIdentity };

export const authService = {
  login: (credentials: { username?: string; email?: string; password: string }) =>
    apiClient<{ user: AccountIdentity }>('/api/accounts/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    apiClient<{ ok: boolean }>('/api/accounts/logout/', { method: 'POST' }),
  // The backend wraps the identity in { "user": ... }.
  getMe: async () => {
    const data = await apiClient<{ user: AccountIdentity } | AccountIdentity>(
      '/api/accounts/me/'
    );
    return 'user' in data ? data.user : data;
  },
};

export const vendorService = {
  listVendors: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<{ vendors: VendorDTO[] }>(`/api/vendors/${q}`);
  },
  getVendor: (id: string) => apiClient<VendorDTO>(`/api/vendors/${id}/`),
  createVendor: (payload: Partial<VendorDTO>) =>
    apiClient<VendorDTO>('/api/vendors/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  toggleActive: (id: string) =>
    apiClient<{ id: string; is_active: boolean }>(`/api/vendors/${id}/toggle-active/`, {
      method: 'POST',
    }),
  listProjects: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<{ projects: ProjectDTO[] }>(`/api/vendors/projects/${q}`);
  },
  getProject: (id: string) => apiClient<ProjectDTO>(`/api/vendors/projects/${id}/`),
  createProject: (payload: Partial<ProjectDTO>) =>
    apiClient<ProjectDTO>('/api/vendors/projects/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  toggleProjectActive: (id: string) =>
    apiClient<{ id: string; is_active: boolean }>(`/api/vendors/projects/${id}/toggle-active/`, {
      method: 'POST',
    }),
};

export const paymentService = {
  listRequests: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<PaginatedResponse<PaymentRequestDTO>>(`/api/payments/${q}`);
  },
  getRequest: (id: string) => apiClient<PaymentRequestDTO>(`/api/payments/${id}/`),
  createRequest: (payload: Record<string, unknown>) =>
    apiClient<PaymentRequestDTO>('/api/payments/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const approvalService = {
  getQueue: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<PaginatedResponse<ApprovalQueueItemDTO>>(`/api/approvals/queue/${q}`);
  },
  getDetail: (requestId: string) =>
    apiClient<ApprovalDetailDTO>(`/api/approvals/${requestId}/`),
  recordDecision: (
    requestId: string,
    payload: { decision: 'APPROVED' | 'REJECTED'; tier?: 'MANAGER' | 'FINANCE'; reason?: string }
  ) =>
    apiClient<{ status: string; approval_id?: string; payment_request_id?: string }>(
      `/api/approvals/${requestId}/decide/`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  approve: (requestId: string) =>
    apiClient<{ status: string; payment_request_id?: string }>(`/api/approvals/${requestId}/approve/`, {
      method: 'POST',
    }),
  reject: (requestId: string, reason: string) =>
    apiClient<{ status: string; reason?: string }>(`/api/approvals/${requestId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  updateAmount: (requestId: string, amount: string | number) =>
    apiClient<{ status: string; amount?: string; payment_request_id?: string }>(
      `/api/approvals/${requestId}/update-amount/`,
      {
        method: 'POST',
        body: JSON.stringify({ amount: String(amount) }),
      }
    ),
};

export const auditService = {
  listEvents: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<PaginatedResponse<AuditEventDTO>>(`/api/audit/${q}`);
  },
  getEntityTrail: (entityType: string, entityId: string) =>
    apiClient<PaginatedResponse<AuditEventDTO>>(`/api/audit/entity/${entityType}/${entityId}/`),
};

export const reportingService = {
  getSummary: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<ActivitySummaryDTO>(`/api/reporting/summary/${q}`);
  },
  getFailedPayments: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<FailedPaymentsReportDTO>(`/api/reporting/failed/${q}`);
  },
  getByProject: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<ProjectBreakdownReportDTO>(`/api/reporting/by-project/${q}`);
  },
};

