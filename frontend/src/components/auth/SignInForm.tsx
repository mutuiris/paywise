'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import { SubmitButton } from './SubmitButton';
import { ForgotNotice } from './ForgotNotice';
import { authService } from '@/lib/api/services';
import { ApiClientError } from '@/lib/api/client';
import { setClientSession, getRoleDashboardPath } from '@/lib/auth/session';
import { DEMO_USERS } from '@/types/auth';

interface AuthError {
  title: string;
  message: string;
  suggestion?: string;
}

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError({
        title: 'Missing required fields',
        message: 'Please enter both your work email or username and your password.',
        suggestion: 'Both fields are required to sign into your PayWise portal.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Attempt authentication with backend API endpoint
      const res = await authService.login({
        username: trimmedEmail,
        password,
      });

      if (res && res.user) {
        setClientSession(res.user);
        router.push(getRoleDashboardPath(res.user.role));
        return;
      }
    } catch (err: unknown) {
      // 2. Human-centered error handling mapping
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setError({
            title: 'Incorrect credentials',
            message: 'The email/username or password you entered does not match our records.',
            suggestion: 'Please verify your spelling, ensure Caps Lock is off, or try one of the demo users (faith, carol, alice, or grace).',
          });
          return;
        }

        if (err.status === 403) {
          setError({
            title: 'Account inactive',
            message: 'This user account is currently disabled or pending administrative activation.',
            suggestion: 'Please contact your system administrator or IT Support to reactivate your access.',
          });
          return;
        }

        // If backend returned a 5xx or server proxy error, check for offline demo match
        if (err.status >= 500) {
          const normalized = trimmedEmail.toLowerCase();
          const matchedUser = Object.values(DEMO_USERS).find(
            (u) =>
              u.email.toLowerCase() === normalized ||
              u.name.toLowerCase().includes(normalized) ||
              normalized.includes(u.name.toLowerCase().split(' ')[0])
          );

          if (matchedUser && password.trim().length > 0) {
            setClientSession({
              id: matchedUser.id,
              name: matchedUser.name,
              email: matchedUser.email,
              role: matchedUser.role,
              isActive: true,
              department: matchedUser.department,
              approvalLimit: matchedUser.approvalLimit,
            });
            router.push(getRoleDashboardPath(matchedUser.role));
            return;
          }

          // If not a matching demo user, present user-friendly credential mismatch rather than server failure
          setError({
            title: 'Incorrect credentials',
            message: 'The email/username or password you entered does not match our records.',
            suggestion: 'For testing, you can sign in as faith (Finance), carol (Manager), grace (Admin), or alice (Employee) with password: password123.',
          });
          return;
        }

        // Other client errors (400 validation, etc.)
        setError({
          title: 'Unable to sign in',
          message: err.data?.detail || err.message || 'Please check your information and try again.',
          suggestion: 'Ensure your work email or username and password are typed correctly.',
        });
        return;
      }

      // Network failure (offline / unreachable fetch)
      if (err instanceof Error) {
        const normalized = trimmedEmail.toLowerCase();
        const matchedUser = Object.values(DEMO_USERS).find(
          (u) =>
            u.email.toLowerCase() === normalized ||
            u.name.toLowerCase().includes(normalized) ||
            normalized.includes(u.name.toLowerCase().split(' ')[0])
        );

        if (matchedUser && password.trim().length > 0) {
          setClientSession({
            id: matchedUser.id,
            name: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role,
            isActive: true,
            department: matchedUser.department,
            approvalLimit: matchedUser.approvalLimit,
          });
          router.push(getRoleDashboardPath(matchedUser.role));
          return;
        }

        setError({
          title: 'Incorrect credentials',
          message: 'The email/username or password you entered does not match our records.',
          suggestion: 'Please verify your spelling or test using demo accounts: faith, carol, alice, or grace.',
        });
        return;
      }

      setError({
        title: 'Sign in failed',
        message: 'An unexpected authentication error occurred.',
        suggestion: 'Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = Boolean(error);

  return (
    <div>
      <ForgotNotice show={showForgotNotice} />

      {error && (
        <div
          id="signin-error"
          role="alert"
          aria-live="assertive"
          className="mb-5 rounded-xl border border-red-200/90 bg-red-50/90 p-3.5 text-red-950 shadow-xs transition-all animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5 rounded-full bg-red-100 p-1 text-red-600">
              <AlertCircle className="size-4" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-red-950 text-xs tracking-wide uppercase">
                {error.title}
              </h4>
              <p className="text-xs leading-relaxed text-red-800">
                {error.message}
              </p>
              {error.suggestion && (
                <p className="text-[11px] leading-relaxed text-red-700/90 pt-0.5">
                  <span className="font-semibold">Tip:</span> {error.suggestion}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="shrink-0 rounded p-1 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <EmailField
          value={email}
          onChange={handleEmailChange}
          hasError={hasError}
          disabled={isSubmitting}
          ariaDescribedBy={hasError ? 'signin-error' : undefined}
        />
        <PasswordField
          value={password}
          onChange={handlePasswordChange}
          onForgotPassword={() => setShowForgotNotice((prev) => !prev)}
          hasError={hasError}
          disabled={isSubmitting}
          ariaDescribedBy={hasError ? 'signin-error' : undefined}
        />
        <RememberMeCheckbox
          checked={rememberMe}
          onChange={setRememberMe}
        />
        <SubmitButton
          isLoading={isSubmitting}
          disabled={isSubmitting}
        />
      </form>
    </div>
  );
}
