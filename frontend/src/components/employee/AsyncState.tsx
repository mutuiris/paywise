'use client';

import React from 'react';
import { AlertTriangle, Database, Inbox, PlugZap, RefreshCw } from 'lucide-react';
import type { ApiError } from '@/lib/api-client';
import { DEMO_MODE } from '@/lib/config';

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 border-b border-gray-100 px-6 py-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <div
              key={columnIndex}
              className="h-3 rounded bg-gray-200"
              style={{ width: columnIndex === 0 ? '70%' : '100%' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6"
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
        >
          <div className="h-3 w-2/3 rounded bg-gray-200" />
          <div className="mt-4 h-6 w-1/3 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse space-y-4 rounded-xl border border-gray-200 bg-white p-6"
        >
          <div className="h-10 w-10 rounded-xl bg-gray-200" />
          <div className="h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

const ERROR_COPY: Record<string, { title: string; hint: string }> = {
  config: {
    title: 'API not configured',
    hint:
      'Set NEXT_PUBLIC_API_URL to the Paywise backend origin (see frontend/.env.example) and restart the dev server.',
  },
  network: {
    title: 'Cannot reach the Paywise API',
    hint: 'The backend may be offline, blocked by CORS, or unreachable from this browser.',
  },
  unauthorized: {
    title: 'Sign-in required',
    hint: 'Your session is missing or has expired. Sign in again to view your requests.',
  },
  forbidden: {
    title: 'Access denied',
    hint: 'Your account does not have permission to view this information.',
  },
  notfound: {
    title: 'Integration blocked',
    hint: 'The endpoint this page needs is not available on the backend yet.',
  },
  validation: {
    title: 'The request was rejected',
    hint: 'The backend reported a validation problem with the submitted data.',
  },
  conflict: {
    title: 'Conflicting record',
    hint: 'The backend reported a conflict, such as a duplicate invoice for this vendor.',
  },
  server: {
    title: 'Backend error',
    hint: 'The Paywise API reported a server error. This is not a problem with your data entry.',
  },
  unknown: {
    title: 'Something went wrong',
    hint: 'An unexpected error occurred while loading this page.',
  },
};

export function ErrorState({
  error,
  onRetry,
  context,
}: {
  error: ApiError;
  onRetry?: () => void;
  context?: string;
}) {
  const copy = ERROR_COPY[error.kind] ?? ERROR_COPY.unknown;
  return (
    <div
      role="alert"
      className="rounded-xl border border-gray-200 bg-white p-8 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{copy.title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
        {context ? `${context} ` : ''}
        {copy.hint}
      </p>
      {error.detail && error.detail !== copy.title ? (
        <p className="mx-auto mt-3 max-w-md rounded-lg bg-gray-50 px-3 py-2 font-mono text-xs text-gray-500">
          {error.detail}
        </p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 text-gray-500" />
          <span>Retry</span>
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-gray-500">{description}</p>
      ) : null}
    </div>
  );
}

export function IntegrationBlockedState({
  title = 'This journey is not connected yet',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <PlugZap className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-lg text-sm text-gray-600">
        {description ??
          'The Paywise backend does not expose this endpoint yet, so no data has been saved. This is an integration status, not a success.'}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-50"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      ) : null}
    </div>
  );
}

export function DemoDataBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
      <Database className="h-4 w-4 shrink-0" />
      <span>
        <strong className="font-semibold">Demo data.</strong> Fixture data is shown because
        NEXT_PUBLIC_DEMO_MODE is enabled. Requests are never written to a backend in this mode.
      </span>
    </div>
  );
}
