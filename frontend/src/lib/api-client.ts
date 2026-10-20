import { API_CONFIGURED, API_URL } from './config';
import type { ApiErrorKind, Collection, FieldErrors } from '@/types/api';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly fieldErrors: FieldErrors;
  readonly detail: string;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number | null; fieldErrors?: FieldErrors; detail?: string } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status ?? null;
    this.fieldErrors = options.fieldErrors ?? {};
    this.detail = options.detail ?? message;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  if (error instanceof Error) return new ApiError('unknown', error.message);
  return new ApiError('unknown', 'An unexpected error occurred.');
}

export type QueryValue = string | number | boolean | null | undefined;

export function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function toArray<T>(data: Collection<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfBootstrap: Promise<void> | null = null;

/**
 * The backend issues the CSRF cookie from GET /api/accounts/csrf/. Unsafe
 * requests (sign-in, sign-out, writes) need that cookie plus the matching
 * X-CSRFToken header, so fetch it once before the first unsafe call.
 */
async function ensureCsrfCookie(): Promise<void> {
  if (readCookie('csrftoken')) return;
  if (!csrfBootstrap) {
    csrfBootstrap = apiFetch<{ csrfToken: string }>('/api/accounts/csrf/')
      .then(() => undefined)
      .catch(() => undefined);
  }
  await csrfBootstrap;
}

function extractErrors(payload: unknown): { fieldErrors: FieldErrors; detail: string } {
  const fieldErrors: FieldErrors = {};
  let detail = '';

  const collect = (value: unknown): string[] =>
    Array.isArray(value) ? value.map(String) : [String(value)];

  const visit = (record: Record<string, unknown>, topLevel: boolean) => {
    Object.entries(record).forEach(([key, value]) => {
      if (key === 'detail' || key === 'non_field_errors') {
        if (!detail) detail = collect(value).join(' ');
        return;
      }
      if (key === 'error') {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          visit(value as Record<string, unknown>, false);
          return;
        }
        if (topLevel) {
          if (!detail) detail = collect(value).join(' ');
          return;
        }
      }
      fieldErrors[key] = collect(value);
    });
  };

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    visit(payload as Record<string, unknown>, true);
  } else if (typeof payload === 'string' && payload.trim() && payload.length <= 300) {
    detail = payload.trim();
  }

  return { fieldErrors, detail };
}

function normalizeError(status: number, payload: unknown): ApiError {
  const { fieldErrors, detail } = extractErrors(payload);

  if (status === 401) {
    return new ApiError('unauthorized', 'You need to sign in to continue.', {
      status,
      fieldErrors,
      detail,
    });
  }
  if (status === 403) {
    return new ApiError('forbidden', 'You do not have permission to perform this action.', {
      status,
      fieldErrors,
      detail,
    });
  }
  if (status === 404) {
    return new ApiError('notfound', 'The requested resource was not found.', {
      status,
      fieldErrors,
      detail,
    });
  }
  if (status === 400 || status === 422) {
    return new ApiError('validation', 'Some details need attention.', {
      status,
      fieldErrors,
      detail: detail || 'Some details need attention.',
    });
  }
  if (status === 409) {
    return new ApiError('conflict', 'This request conflicts with an existing record.', {
      status,
      fieldErrors,
      detail: detail || 'This request conflicts with an existing record.',
    });
  }
  if (status >= 500) {
    return new ApiError('server', 'The Paywise API reported a server error.', {
      status,
      fieldErrors,
      detail,
    });
  }
  return new ApiError('unknown', detail || 'Unexpected API response.', {
    status,
    fieldErrors,
  });
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null;
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!API_CONFIGURED) {
    throw new ApiError('config', 'The Paywise API base URL is not configured.', {
      detail:
        'Set NEXT_PUBLIC_API_URL (or PAYWISE_API_ORIGIN for the same-origin proxy) in your environment (see frontend/.env.example) to reach the backend.',
    });
  }

  // With no public API URL the request stays same-origin and is forwarded by
  // the Next.js rewrite, which keeps session cookies and CSRF working.
  const url = API_URL
    ? `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
    : path.startsWith('/')
      ? path
      : `/${path}`;
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  let body = options.body as BodyInit | null | undefined;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isFormData && typeof body === 'object') {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    await ensureCsrfCookie();
    const csrf = readCookie('csrftoken');
    if (csrf) headers.set('X-CSRFToken', csrf);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      method,
      headers,
      body,
      credentials: 'include',
    });
  } catch {
    throw new ApiError('network', 'Unable to reach the Paywise API.', {
      detail: 'Check that the backend is running and reachable from this browser.',
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (response.ok) {
    return payload as T;
  }

  throw normalizeError(response.status, payload);
}
