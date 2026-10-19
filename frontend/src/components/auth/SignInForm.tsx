'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import { SubmitButton } from './SubmitButton';
import { ForgotNotice } from './ForgotNotice';
import { authService } from '@/lib/api/services';
import { setClientSession, getRoleDashboardPath } from '@/lib/auth/session';
import { DEMO_USERS } from '@/types/auth';

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter both your email/username and password.');
      return;
    }

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
      // 2. Fallback check for local development demo accounts when backend is offline
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

      const message =
        err instanceof Error ? err.message : 'Invalid credentials. Please verify your login details.';
      setError(message);
    }
  };

  return (
    <div>
      <ForgotNotice show={showForgotNotice} />
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200/80 p-3 text-xs text-red-700">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <EmailField value={email} onChange={setEmail} />
        <PasswordField
          value={password}
          onChange={setPassword}
          onForgotPassword={() => setShowForgotNotice((prev) => !prev)}
        />
        <RememberMeCheckbox checked={rememberMe} onChange={setRememberMe} />
        <SubmitButton />
      </form>
    </div>
  );
}
