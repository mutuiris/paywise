'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react';

export function SignInCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI sign-in action handler
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
              Welcome back!
            </h1>
            <p className="mt-2 text-sm text-muted-ink">
             Signin to continue with PayWise
            </p>
          </div>

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
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11 pr-4 py-2.5 text-sm font-serif bg-surface border-line text-ink placeholder:text-muted-ink/60 focus:border-brand"
                  placeholder="Enter your work email"
                />
              </div>
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
                  onChange={(e) => setPassword(e.target.value)}
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
                <span>Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-deep active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Sign in</span>
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
