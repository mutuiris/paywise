'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  onForgotPassword: () => void;
}

export function PasswordField({ value, onChange, onForgotPassword }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
        <button type="button" onClick={onForgotPassword} className="text-xs font-medium text-brand hover:underline cursor-pointer">
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pl-11 pr-11 py-2.5 text-sm font-serif bg-surface border-line text-ink placeholder:text-muted-ink/60 focus:border-brand"
          placeholder="Enter your password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded text-muted-ink hover:text-ink transition-colors cursor-pointer"
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
