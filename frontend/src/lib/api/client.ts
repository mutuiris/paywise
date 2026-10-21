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

/**
 * Empty by default so requests stay same-origin and are forwarded by the
 * Next.js rewrite in next.config.ts. Setting NEXT_PUBLIC_API_BASE_URL calls
 * the backend directly, which requires the backend to allow this origin.
 */
const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfBootstrap: Promise<void> | null = null;

/**
 * Django protects unsafe methods, so the CSRF cookie has to exist before the
 * first POST. The backend issues it from GET /api/accounts/csrf/.
 */
async function ensureCsrfCookie(): Promise<void> {
  if (getCsrfToken()) return;
  if (!csrfBootstrap) {
    csrfBootstrap = apiClient<{ csrfToken: string }>('/api/accounts/csrf/')
      .then(() => undefined)
      .catch(() => undefined);
  }
  await csrfBootstrap;
}

/** The backend reports errors as {"detail": "..."} or {"error": "..."}. */
function readErrorMessage(data: ApiErrorEnvelope | undefined, endpoint: string, status: number): string {
  const detail = data?.detail;
  if (typeof detail === 'string' && detail) return detail;

  const error = data?.error;
  if (typeof error === 'string' && error) return error;
  if (error && typeof error === 'object') {
    const messages = Object.values(error).flatMap((value) =>
      Array.isArray(value) ? value.map(String) : [String(value)]
    );
    if (messages.length > 0) return messages.join(' ');
  }

  if (typeof data?.message === 'string' && data.message) return data.message;
  return `API Request to ${endpoint} failed with status ${status}`;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isSafe = ['GET', 'HEAD', 'OPTIONS'].includes(method);

  if (!isSafe) {
    await ensureCsrfCookie();
  }

  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const csrf = getCsrfToken();
  if (csrf && !isSafe) {
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
    throw new ApiClientError(
      readErrorMessage(errorData, endpoint, res.status),
      res.status,
      errorData
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
