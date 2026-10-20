import React from 'react';
import { User } from 'lucide-react';

interface UsernameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function UsernameField({ value, onChange }: UsernameFieldProps) {
  return (
    <div>
      <label htmlFor="username" className="mb-2 block text-sm font-medium text-ink">
        Username
      </label>
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-ink">
          <User className="size-4" />
        </div>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pl-11 pr-4 py-2.5 text-sm font-serif bg-surface border-line text-ink placeholder:text-muted-ink/60 focus:border-brand"
          placeholder="Enter your Paywise username"
        />
      </div>
    </div>
  );
}
