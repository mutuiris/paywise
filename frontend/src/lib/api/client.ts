import { ApiErrorEnvelope } from './types';

export class ApiClientError extends Error {
  status: number;
  data?: ApiErrorEnvelope;

  constructor(message: string, status: number, data?: ApiErrorEnvelope) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.data = data;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const csrf = getCsrfToken();
  if (csrf && !['GET', 'HEAD', 'OPTIONS'].includes(options.method || 'GET')) {
    headers['X-CSRFToken'] = csrf;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errorData: ApiErrorEnvelope | undefined;
    try {
      errorData = await res.json();
    } catch {
      // Body is not JSON
    }
    const message =
      errorData?.detail ||
      errorData?.message ||
      `API Request to ${endpoint} failed with status ${res.status}`;
    throw new ApiClientError(message, res.status, errorData);
  }

  return res.json() as Promise<T>;
}
