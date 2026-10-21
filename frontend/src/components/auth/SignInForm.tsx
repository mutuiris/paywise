'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UsernameField } from './UsernameField';
import { PasswordField } from './PasswordField';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import { SubmitButton } from './SubmitButton';
import { ForgotNotice } from './ForgotNotice';
import { signIn } from '@/api/accounts';
import { toApiError, type ApiError } from '@/lib/api-client';
import { DEMO_MODE } from '@/lib/config';

function messageFor(error: ApiError): string {
  if (error.kind === 'unauthorized') {
    return error.detail || 'Those credentials were not recognised. Check your username and password.';
  }
  if (error.kind === 'config') {
    return 'The API is not configured yet, so sign-in is unavailable.';
  }
  if (error.kind === 'network') {
    return 'We could not reach the Paywise API. Check that the backend is running.';
  }
  return error.detail || 'We could not sign you in. Please try again.';
}

const DEMO_ACCOUNTS = [
  {
    name: 'Faith Njeri',
    role: 'Finance Officer',
    email: 'faith.njeri@imaraworks.co.ke',
    target: '/finance/dashboard',
  },
  {
    name: 'Carol Wanjiku',
    role: 'Manager',
    email: 'carol.wanjiku@imaraworks.co.ke',
    target: '/manager/dashboard',
  },
  {
    name: 'David Mutua',
    role: 'Manager',
    email: 'david.mua@imaraworks.co.ke',
    target: '/manager/dashboard',
  },
  {
    name: 'Alice Mwangi',
    role: 'Employee',
    email: 'alice.mwangi@imaraworks.co.ke',
    target: '/employee',
  },
];

export function SignInForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (DEMO_MODE || isSubmitting) return;

    if (!username.trim() || !password) {
      setError(toApiError(new Error('Enter your username and password.')));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await signIn(username.trim(), password, rememberMe);
      router.push('/employee');
      router.refresh();
    } catch (caught) {
      setError(toApiError(caught));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo quick access only routes to a role dashboard. It never authenticates:
  // in demo mode the pages render labelled fixture data, and in live mode the
  // real sign-in above is required.
  const handleSelectDemo = (demo: (typeof DEMO_ACCOUNTS)[number]) => {
    router.push(demo.target);
  };

  return (
    <div>
      <ForgotNotice show={showForgotNotice} />
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <UsernameField value={username} onChange={setUsername} />
        <PasswordField
          value={password}
          onChange={setPassword}
          onForgotPassword={() => setShowForgotNotice((prev) => !prev)}
        />
        <RememberMeCheckbox checked={rememberMe} onChange={setRememberMe} />
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {messageFor(error)}
          </p>
        ) : null}
        {DEMO_MODE ? (
          <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Demo mode is on, so sign-in is disabled. Open the employee dashboard directly to browse
            labelled fixture data.
          </p>
        ) : null}
        <SubmitButton
          disabled={isSubmitting || DEMO_MODE}
          label={isSubmitting ? 'Signing in...' : 'Sign in'}
        />
      </form>

      {DEMO_MODE ? (
        <div className="mt-8 rounded-lg border border-dashed border-line bg-surface p-4">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-ink">
            Demo accounts (development only)
          </p>
          <p className="mt-1 text-[12px] text-muted-ink">
            Click any account to jump directly into that role:
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <li key={acc.email}>
                <button
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className="w-full rounded-md border border-line p-2 text-left transition hover:border-brand hover:bg-brand/5 cursor-pointer"
                >
                  <span className="block text-[13px] font-medium text-ink">{acc.name}</span>
                  <span className="block text-[11px] text-muted-ink">{acc.role}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
