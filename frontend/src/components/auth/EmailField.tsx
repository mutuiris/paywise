import React from 'react';
import { Mail } from 'lucide-react';

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  ariaDescribedBy?: string;
}

export function EmailField({
  value,
  onChange,
  hasError = false,
  disabled = false,
  ariaDescribedBy,
}: EmailFieldProps) {
  return (
    <div>
      <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
        Work email or username
      </label>
      <div className="relative flex items-center">
        <div
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors ${
            hasError ? 'text-red-500' : 'text-muted-ink'
          }`}
        >
          <Mail className="size-4" />
        </div>
        <input
          id="email"
          type="text"
          autoComplete="username"
          value={value}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={ariaDescribedBy}
          onChange={(e) => onChange(e.target.value)}
          className={`input-field pl-11 pr-4 py-2.5 text-sm font-serif bg-surface text-ink placeholder:text-muted-ink/60 transition-colors ${
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-line focus:border-brand'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
          placeholder="e.g. faith.njeri@imaraworks.co.ke or faith"
        />
      </div>
    </div>
  );
}
