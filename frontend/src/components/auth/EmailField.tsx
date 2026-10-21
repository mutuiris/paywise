import React from 'react';
import { Mail } from 'lucide-react';

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmailField({ value, onChange }: EmailFieldProps) {
  return (
    <div>
      <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pl-11 pr-4 py-2.5 text-sm font-serif bg-surface border-line text-ink placeholder:text-muted-ink/60 focus:border-brand"
          placeholder="Enter your work email"
        />
      </div>
    </div>
  );
}
