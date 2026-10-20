import { apiFetch, buildQuery, toArray } from '@/lib/api-client';
import type { Collection } from '@/types/api';
import type {
  PaymentMethod,
  PaymentRequest,
  PaymentRequestStatus,
} from '@/types/domain';

export interface PaymentRequestFilters {
  status?: PaymentRequestStatus;
  search?: string;
}

export async function listPaymentRequests(
  filters: PaymentRequestFilters = {},
): Promise<PaymentRequest[]> {
  const query = buildQuery({ status: filters.status, search: filters.search });
  const data = await apiFetch<Collection<PaymentRequest>>(`/api/payments/${query}`);
  return toArray(data);
}

export function getPaymentRequest(id: string): Promise<PaymentRequest> {
  return apiFetch<PaymentRequest>(`/api/payments/${id}/`);
}

export interface CreatePaymentRequestInput {
  vendor_id: string;
  project_id: string | null;
  amount: string;
  invoice_number: string;
  description: string;
  payment_method: PaymentMethod;
  supporting_notes?: string;
}

export function createPaymentRequest(
  input: CreatePaymentRequestInput,
): Promise<PaymentRequest> {
  return apiFetch<PaymentRequest & { payment_request?: PaymentRequest }>('/api/payments/', {
    method: 'POST',
    body: { ...input },
  }).then((data) => data.payment_request ?? data);
}

export function submitPaymentRequest(id: string): Promise<PaymentRequest> {
  return apiFetch<PaymentRequest>(`/api/payments/${id}/submit/`, { method: 'POST' });
}
