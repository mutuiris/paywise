'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Loader2,
  Info,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function SignInCard() {
  const router = useRouter();
  const { user, hydrated, isLoading: isAuthLoading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (hydrated && user) {
      router.push('/dashboard');
    }
  }, [hydrated, user, router]);

  const validateForm = () => {
    const errs: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errs.email = 'Enter your work email.';
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      errs.email = 'Enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Enter your password.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-white font-serif lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_500px]">
      {/* Left Column: Image covering 100% of the left side */}
      <div className="relative hidden lg:block min-h-screen w-full overflow-hidden border-r border-line bg-slate-900">
        <Image
          src="/images/paywise-signin.png"
          alt="PayWise Vendor Payment Management"
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 70vw"
        />
      </div>

      {/* Right Column: Sign In Form with Pure White (#ffffff) Background */}
      <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Sign in
            </h1>
          </div>

          {/* Error message alert */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-err/30 bg-red-50/90 p-3.5 text-sm text-err flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <Info className="size-4 shrink-0 mt-0.5 text-err" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Forgot password notice */}
          {showForgotNotice && (
            <div
              role="status"
              className="mb-6 rounded-lg border border-line bg-surface p-3.5 text-sm text-muted-ink animate-in fade-in duration-200"
            >
              Password resets are managed by system administrators. Please contact your internal administrator.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Work Email Field */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-ink"
              >
                Work email
              </label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-ink">
                  <Mail className="size-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-err' : undefined}
                  className="input-field pl-11 pr-4 py-2.5 text-sm font-serif bg-surface border-line text-ink placeholder:text-muted-ink/60 focus:border-brand"
                  placeholder="Enter your work email"
                />
              </div>
              {errors.email && (
                <p id="email-err" className="mt-1.5 text-xs text-err font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-ink"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice((prev) => !prev)}
                  className="text-xs font-medium text-brand hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-ink">
                  <Lock className="size-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'pw-err' : undefined}
                  className="input-field pl-11 pr-11 py-2.5 text-sm font-serif bg-surface border-line text-ink placeholder:text-muted-ink/60 focus:border-brand"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded text-muted-ink hover:text-ink transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="pw-err" className="mt-1.5 text-xs text-err font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2.5 text-sm text-ink select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-line text-brand focus:ring-brand accent-brand cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isAuthLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-deep active:scale-[0.99] transition-all disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
