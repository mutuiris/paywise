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

    await signIn(trimmedEmail, password);
  };

  const signIn = async (username: string, secret: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await authService.login({ username, password: secret });
      setClientSession(res.user);
      router.push(getRoleDashboardPath(res.user.role));
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        // The backend answers 401 for both bad credentials and inactive accounts.
        if (err.status === 401 && /inactive/i.test(err.message)) {
          setError({
            title: 'Account inactive',
            message: 'This user account is currently disabled or pending administrative activation.',
            suggestion: 'Please contact your system administrator or IT Support to reactivate your access.',
          });
          return;
        }

        if (err.status === 401) {
          setError({
            title: 'Incorrect credentials',
            message: 'Email/username or password do not match.',
            suggestion: 'Please verify your spelling and ensure Caps Lock is off.',
          });
          return;
        }

        // 403 here is Django's CSRF/origin check, not the account.
        if (err.status === 403) {
          setError({
            title: 'Sign-in blocked by security check',
            message: 'The server did not trust this page\'s origin.',
            suggestion: 'Add this site\'s origin to DJANGO_CSRF_TRUSTED_ORIGINS on the backend.',
          });
          return;
        }

        if (err.status >= 500) {
          setError({
            title: 'Server error',
            message: 'The PayWise server could not complete the sign-in.',
            suggestion: 'Please try again shortly. If it keeps failing, contact IT Support.',
          });
          return;
        }

        setError({
          title: 'Unable to sign in',
          message: err.message || 'Please check your information and try again.',
          suggestion: 'Ensure your work email or username and password are typed correctly.',
        });
        return;
      }

      setError({
        title: "Can't reach PayWise",
        message: 'The sign-in server is unreachable.',
        suggestion: 'Check your connection, or confirm the backend is running, then try again.',
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
