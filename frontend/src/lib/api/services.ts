import { apiClient } from './client';
import type { BackendUserRole } from './types';
import {
  Vendor,
  VendorDTO,
  Project,
  ProjectDTO,
  PaymentRequest,
  PaymentRequestDTO,
  ApprovalQueueItemDTO,
  ApprovalDetailDTO,
  AuditEventDTO,
  ActivitySummaryDTO,
  FailedPaymentsReportDTO,
  ProjectBreakdownReportDTO,
  User,
  VendorListResponse,
  ProjectListResponse,
  PaymentRequestListResponse,
  ApprovalQueueResponse,
  AuditEventListResponse,
  NormalizedVendorResponse,
  NormalizedProjectResponse,
  NormalizedPaymentRequestResponse,
  PaymentMethod,
  PaymentRequestStatus,
  PaginatedResponse,
} from './types';

type UnknownRecord = Record<string, unknown>;

// ==========================================
// Lightweight Normalization Layer
// ==========================================

export function normalizeVendor(raw: unknown): Vendor {
  if (!raw || typeof raw !== 'object') {
    return {
      id: '',
      name: '',
      service: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      payoutMethod: 'BANK',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  }

  const rec = raw as UnknownRecord;
  const v = (rec.vendor && typeof rec.vendor === 'object' ? rec.vendor : rec) as UnknownRecord;
  const pd = (v.payment_details && typeof v.payment_details === 'object'
    ? v.payment_details
    : {}) as UnknownRecord;

  const rawMethod = String(v.payoutMethod || pd.payout_method || 'BANK').toUpperCase();
  const payoutMethod: PaymentMethod = rawMethod === 'MPESA' ? 'MPESA' : 'BANK';

  return {
    id: String(v.id || ''),
    name: String(v.name || ''),
    service: String(v.service || v.service_category || 'Contractor'),
    contactName: String(v.contactName || v.name || ''),
    contactEmail: String(v.contactEmail || v.email || ''),
    contactPhone: String(v.contactPhone || v.phone_number || ''),
    payoutMethod,
    bankName: typeof pd.bank_name === 'string' ? pd.bank_name : typeof v.bankName === 'string' ? v.bankName : undefined,
    accountNumber:
      typeof pd.account_number === 'string'
        ? pd.account_number
        : typeof pd.mpesa_number === 'string'
        ? pd.mpesa_number
        : typeof v.accountNumber === 'string'
        ? v.accountNumber
        : undefined,
    isActive: Boolean(v.isActive ?? v.is_active ?? true),
    createdAt: String(v.createdAt || v.created_at || new Date().toISOString()),
  };
}

export function normalizeProject(raw: unknown): Project {
  if (!raw || typeof raw !== 'object') {
    return {
      id: '',
      name: '',
      code: '',
      department: '',
      siteLocation: '',
      isActive: true,
    };
  }

  const rec = raw as UnknownRecord;
  const p = (rec.project && typeof rec.project === 'object' ? rec.project : rec) as UnknownRecord;
  return {
    id: String(p.id || ''),
    name: String(p.name || ''),
    code: String(p.code || ''),
    department: String(p.department || ''),
    siteLocation: String(p.siteLocation || p.site_location || p.description || ''),
    isActive: Boolean(p.isActive ?? p.is_active ?? true),
  };
}

export function normalizePaymentRequest(raw: unknown): PaymentRequest {
  if (!raw || typeof raw !== 'object') {
    return {
      id: '',
      reference: 'PR-REQ',
      vendorId: '',
      vendorName: 'Designated Vendor',
      amount: 0,
      currency: 'KES',
      invoiceNumber: 'INV-REQ',
      project: 'ImaraWorks Construction',
      requesterId: '',
      requesterName: 'Employee',
      paymentMethod: 'MPESA',
      reason: '',
      notes: '',
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const rec = raw as UnknownRecord;
  const r = (rec.payment_request && typeof rec.payment_request === 'object'
    ? rec.payment_request
    : rec) as UnknownRecord;

  const rawMethod = String(r.paymentMethod || r.payment_method || 'MPESA').toUpperCase();
  const paymentMethod: PaymentMethod =
    rawMethod === 'BANK' || rawMethod === 'BANK_TRANSFER' ? 'BANK' : 'MPESA';

  return {
    id: String(r.id || ''),
    reference: String(
      r.reference || r.invoice_number || (r.id ? `PR-${String(r.id).slice(0, 6).toUpperCase()}` : 'PR-REQ')
    ),
    vendorId: String(r.vendorId || r.vendor_id || ''),
    vendorName: String(r.vendorName || r.vendor_name || 'Designated Vendor'),
    amount: typeof r.amount === 'number' ? r.amount : parseFloat(String(r.amount)) || 0,
    currency: 'KES',
    invoiceNumber: String(
      r.invoiceNumber || r.invoice_number || (r.id ? `INV-${String(r.id).slice(0, 6).toUpperCase()}` : 'INV-REQ')
    ),
    project: String(r.project || r.project_name || 'ImaraWorks Construction'),
    requesterId: String(r.requesterId || r.requester_id || ''),
    requesterName: String(r.requesterName || r.requester_username || 'Employee'),
    paymentMethod,
    reason: String(r.reason || r.description || ''),
    notes: String(r.notes || r.supporting_notes || r.description || ''),
    status: (r.status || 'DRAFT') as PaymentRequestStatus,
    rejectionReason:
      typeof r.rejectionReason === 'string'
        ? r.rejectionReason
        : typeof r.rejection_reason === 'string'
        ? r.rejection_reason
        : undefined,
    createdAt: String(r.createdAt || r.created_at || new Date().toISOString()),
    updatedAt: String(r.updatedAt || r.updated_at || new Date().toISOString()),
  };
}

// Helpers to wrap array-like responses that also expose backend wrapped envelope properties
function createVendorListResponse(rawVendors: VendorDTO[]): VendorListResponse {
  const normalized = rawVendors.map(normalizeVendor);
  Object.defineProperty(normalized, 'vendors', {
    value: rawVendors,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(normalized, 'count', {
    value: rawVendors.length,
    enumerable: true,
    configurable: true,
  });
  return normalized as VendorListResponse;
}

function createProjectListResponse(rawProjects: ProjectDTO[]): ProjectListResponse {
  const normalized = rawProjects.map(normalizeProject);
  Object.defineProperty(normalized, 'projects', {
    value: rawProjects,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(normalized, 'count', {
    value: rawProjects.length,
    enumerable: true,
    configurable: true,
  });
  return normalized as ProjectListResponse;
}

function createPaymentRequestListResponse(
  rawResults: PaymentRequestDTO[],
  count: number
): PaymentRequestListResponse {
  const normalized = rawResults.map(normalizePaymentRequest);
  Object.defineProperty(normalized, 'results', {
    value: rawResults,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(normalized, 'count', {
    value: count,
    enumerable: true,
    configurable: true,
  });
  return normalized as PaymentRequestListResponse;
}

function createApprovalQueueResponse(
  rawResults: ApprovalQueueItemDTO[],
  count: number
): ApprovalQueueResponse {
  const copy = [...rawResults];
  Object.defineProperty(copy, 'results', {
    value: rawResults,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(copy, 'count', {
    value: count,
    enumerable: true,
    configurable: true,
  });
  return copy as ApprovalQueueResponse;
}

function createAuditEventListResponse(
  rawResults: AuditEventDTO[],
  count: number
): AuditEventListResponse {
  const copy = [...rawResults];
  Object.defineProperty(copy, 'results', {
    value: rawResults,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(copy, 'count', {
    value: count,
    enumerable: true,
    configurable: true,
  });
  return copy as AuditEventListResponse;
}

function createVendorResponse(raw: unknown): NormalizedVendorResponse {
  const rec = (raw && typeof raw === 'object' ? raw : {}) as UnknownRecord;
  const dto: VendorDTO = (rec.vendor && typeof rec.vendor === 'object' ? rec.vendor : rec) as VendorDTO;
  const normalized = normalizeVendor(dto);
  return Object.assign(normalized, { vendor: dto });
}

function createProjectResponse(raw: unknown): NormalizedProjectResponse {
  const rec = (raw && typeof raw === 'object' ? raw : {}) as UnknownRecord;
  const dto: ProjectDTO = (rec.project && typeof rec.project === 'object' ? rec.project : rec) as ProjectDTO;
  const normalized = normalizeProject(dto);
  return Object.assign(normalized, { project: dto });
}

function createPaymentRequestResponse(raw: unknown): NormalizedPaymentRequestResponse {
  const rec = (raw && typeof raw === 'object' ? raw : {}) as UnknownRecord;
  const dto: PaymentRequestDTO = (rec.payment_request && typeof rec.payment_request === 'object'
    ? rec.payment_request
    : rec) as PaymentRequestDTO;
  const normalized = normalizePaymentRequest(dto);
  return Object.assign(normalized, {
    payment_request: dto,
    vendor_id: dto.vendor_id,
    vendor_name: dto.vendor_name,
    project_id: dto.project_id,
    project_name: dto.project_name,
    requester_id: dto.requester_id,
    requester_username: dto.requester_username,
    invoice_number: dto.invoice_number,
    description: dto.description,
    payment_method: dto.payment_method,
    rejection_reason: dto.rejection_reason,
    supporting_notes: dto.supporting_notes,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  });
}

function denormalizeVendorPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...payload };
  if ('service' in payload && !('service_category' in payload)) {
    result.service_category = payload.service;
  }
  if ('contactEmail' in payload && !('email' in payload)) {
    result.email = payload.contactEmail;
  }
  if ('contactPhone' in payload && !('phone_number' in payload)) {
    result.phone_number = payload.contactPhone;
  }
  if ('payoutMethod' in payload || 'bankName' in payload || 'accountNumber' in payload) {
    const pd = (typeof payload.payment_details === 'object' && payload.payment_details
      ? payload.payment_details
      : {}) as UnknownRecord;
    result.payment_details = {
      payout_method: payload.payoutMethod || pd.payout_method || 'BANK',
      bank_name: payload.bankName || pd.bank_name,
      account_number: payload.accountNumber || pd.account_number,
      ...pd,
    };
  }
  return result;
}

function denormalizePaymentPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...payload };
  if ('vendorId' in payload && !('vendor_id' in payload)) {
    result.vendor_id = payload.vendorId;
  }
  if ('projectId' in payload && !('project_id' in payload)) {
    result.project_id = payload.projectId;
  }
  if ('invoiceNumber' in payload && !('invoice_number' in payload)) {
    result.invoice_number = payload.invoiceNumber;
  }
  if ('paymentMethod' in payload && !('payment_method' in payload)) {
    result.payment_method = payload.paymentMethod === 'BANK' ? 'BANK_TRANSFER' : payload.paymentMethod;
  }
  if ('notes' in payload && !('supporting_notes' in payload)) {
    result.supporting_notes = payload.notes;
  }
  if ('reason' in payload && !('description' in payload)) {
    result.description = payload.reason;
  }
  return result;
}

// ==========================================
// API Services
// ==========================================

export const authService = {
  login: (credentials: { username?: string; email?: string; password: string }) =>
    apiClient<{ user: User }>('/api/accounts/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    apiClient<{ ok: boolean; detail?: string }>('/api/accounts/logout/', { method: 'POST' }),
  getMe: async () => {
    const data = await apiClient<{ user: User } | User>('/api/accounts/me/');
    return 'user' in data ? data.user : data;
  },
};

export const vendorService = {
  listVendors: async (params?: Record<string, string>): Promise<VendorListResponse> => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiClient<UnknownRecord | VendorDTO[]>(`/api/vendors/${q}`);
    const rawList: VendorDTO[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.vendors)
      ? (res.vendors as VendorDTO[])
      : [];
    return createVendorListResponse(rawList);
  },
  getVendor: async (id: string): Promise<NormalizedVendorResponse> => {
    const res = await apiClient<UnknownRecord>(`/api/vendors/${id}/`);
    return createVendorResponse(res);
  },
  createVendor: async (payload: Partial<Vendor> & Partial<VendorDTO>): Promise<NormalizedVendorResponse> => {
    const body = denormalizeVendorPayload(payload as Record<string, unknown>);
    const res = await apiClient<UnknownRecord>('/api/vendors/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return createVendorResponse(res);
  },
  toggleActive: async (id: string): Promise<{ id: string; is_active: boolean }> => {
    return apiClient<{ id: string; is_active: boolean }>(`/api/vendors/${id}/toggle-active/`, {
      method: 'POST',
    });
  },
  listProjects: async (params?: Record<string, string>): Promise<ProjectListResponse> => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiClient<UnknownRecord | ProjectDTO[]>(`/api/vendors/projects/${q}`);
    const rawList: ProjectDTO[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.projects)
      ? (res.projects as ProjectDTO[])
      : [];
    return createProjectListResponse(rawList);
  },
  getProject: async (id: string): Promise<NormalizedProjectResponse> => {
    const res = await apiClient<UnknownRecord>(`/api/vendors/projects/${id}/`);
    return createProjectResponse(res);
  },
  createProject: async (payload: Partial<Project> & Partial<ProjectDTO>): Promise<NormalizedProjectResponse> => {
    const res = await apiClient<UnknownRecord>('/api/vendors/projects/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return createProjectResponse(res);
  },
  toggleProjectActive: async (id: string): Promise<{ id: string; is_active: boolean }> => {
    return apiClient<{ id: string; is_active: boolean }>(`/api/vendors/projects/${id}/toggle-active/`, {
      method: 'POST',
    });
  },
};

export const paymentService = {
  listRequests: async (params?: Record<string, string>): Promise<PaymentRequestListResponse> => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiClient<UnknownRecord | PaymentRequestDTO[]>(`/api/payments/${q}`);
    const rawList: PaymentRequestDTO[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.results)
      ? (res.results as PaymentRequestDTO[])
      : [];
    const count = typeof res === 'object' && res && typeof (res as UnknownRecord).count === 'number'
      ? ((res as UnknownRecord).count as number)
      : rawList.length;
    return createPaymentRequestListResponse(rawList, count);
  },
  getRequest: async (id: string): Promise<NormalizedPaymentRequestResponse> => {
    const res = await apiClient<UnknownRecord>(`/api/payments/${id}/`);
    return createPaymentRequestResponse(res);
  },
  createRequest: async (payload: Record<string, unknown>): Promise<NormalizedPaymentRequestResponse> => {
    const body = denormalizePaymentPayload(payload);
    const res = await apiClient<UnknownRecord>('/api/payments/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return createPaymentRequestResponse(res);
  },
  /** Runs an APPROVED request through the backend's (mock) payment provider. */
  processRequest: (id: string, idempotencyKey: string) =>
    apiClient<{ payment_attempt: PaymentAttemptDTO; payment_request: UnknownRecord }>(
      `/api/payments/${id}/process/`,
      { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey } }
    ),
  listAttempts: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient<{ results: PaymentAttemptDTO[]; count: number }>(`/api/payments/attempts/${q}`);
  },
  reconcileAttempt: (attemptId: string) =>
    apiClient<{ payment_attempt: PaymentAttemptDTO; payment_request: UnknownRecord }>(
      `/api/payments/attempts/${attemptId}/reconcile/`,
      { method: 'POST' }
    ),
};

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: BackendUserRole;
  department: string;
  is_active: boolean;
  date_joined: string;
}

/** Administrator-only user management. */
export const userService = {
  list: () => apiClient<{ results: UserDTO[]; count: number }>('/api/accounts/users/'),
  create: (payload: {
    email: string;
    password: string;
    role: BackendUserRole;
    first_name?: string;
    last_name?: string;
    department?: string;
  }) =>
    apiClient<{ user: UserDTO }>('/api/accounts/users/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: { role?: BackendUserRole; department?: string; is_active?: boolean }) =>
    apiClient<{ user: UserDTO }>(`/api/accounts/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

export interface PaymentAttemptDTO {
  id: string;
  payment_request_id: string;
  status: 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'AMBIGUOUS';
  provider_reference: string;
  amount: string;
  failure_reason: string;
  created_at: string | null;
  invoice_number?: string;
  vendor_name?: string;
}

export const approvalService = {
  getQueue: async (params?: Record<string, string>): Promise<ApprovalQueueResponse> => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiClient<UnknownRecord | ApprovalQueueItemDTO[]>(`/api/approvals/queue/${q}`);
    const rawList: ApprovalQueueItemDTO[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.results)
      ? (res.results as ApprovalQueueItemDTO[])
      : [];
    const count = typeof res === 'object' && res && typeof (res as UnknownRecord).count === 'number'
      ? ((res as UnknownRecord).count as number)
      : rawList.length;
    return createApprovalQueueResponse(rawList, count);
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
  listEvents: async (params?: Record<string, string>): Promise<AuditEventListResponse> => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiClient<UnknownRecord | AuditEventDTO[]>(`/api/audit/${q}`);
    const rawList: AuditEventDTO[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.results)
      ? (res.results as AuditEventDTO[])
      : [];
    const count = typeof res === 'object' && res && typeof (res as UnknownRecord).count === 'number'
      ? ((res as UnknownRecord).count as number)
      : rawList.length;
    return createAuditEventListResponse(rawList, count);
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
