import React from 'react';
import { DEMO_ACCOUNTS, DemoAccount } from './demoAccounts';

export type { DemoAccount };

interface Props {
  onSelect: (account: DemoAccount) => void;
}

export function DemoAccountsPicker({ onSelect }: Props) {
  return (
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
              onClick={() => onSelect(acc)}
              className="w-full rounded-md border border-line p-2 text-left transition hover:border-brand hover:bg-brand/5 cursor-pointer"
            >
              <span className="block text-[13px] font-medium text-ink">{acc.name}</span>
              <span className="block text-[11px] text-muted-ink">{acc.role}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
