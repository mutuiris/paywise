import { apiClient } from './client';
import {
  Vendor,
  Project,
  PaymentRequest,
  AuditEventDTO,
  User,
} from './types';

export const authService = {
  login: (credentials: { username: string; password: string }) =>
    apiClient<{ user: User }>('/api/accounts/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    apiClient<{ ok: boolean }>('/api/accounts/logout/', { method: 'POST' }),
  getMe: () => apiClient<User>('/api/accounts/me/'),
};

export const vendorService = {
  listVendors: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<Vendor[]>(`/api/vendors/${q}`);
  },
  getVendor: (id: string) => apiClient<Vendor>(`/api/vendors/${id}/`),
  listProjects: () => apiClient<Project[]>('/api/vendors/projects/'),
};

export const paymentService = {
  listRequests: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<PaymentRequest[]>(`/api/payments/${q}`);
  },
  getRequest: (id: string) => apiClient<PaymentRequest>(`/api/payments/${id}/`),
  createRequest: (payload: Partial<PaymentRequest>) =>
    apiClient<PaymentRequest>('/api/payments/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const approvalService = {
  getQueue: () => apiClient<PaymentRequest[]>('/api/approvals/queue/'),
  approve: (requestId: string) =>
    apiClient<{ status: string }>(`/api/approvals/${requestId}/approve/`, {
      method: 'POST',
    }),
  reject: (requestId: string, reason: string) =>
    apiClient<{ status: string }>(`/api/approvals/${requestId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

export const auditService = {
  listEvents: () => apiClient<AuditEventDTO[]>('/api/audit/'),
};
