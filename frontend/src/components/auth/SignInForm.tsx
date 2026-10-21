'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import { SubmitButton } from './SubmitButton';
import { ForgotNotice } from './ForgotNotice';

const DEMO_ACCOUNTS = [
  {
    name: 'Faith Njeri',
    role: 'Finance Officer',
    email: 'faith.njeri@imaraworks.co.ke',
    target: '/finance/dashboard',
  },
  {
    name: 'Carol Wanjiku',
    role: 'Manager',
    email: 'carol.wanjiku@imaraworks.co.ke',
    target: '/manager/dashboard',
  },
  {
    name: 'David Mutua',
    role: 'Manager',
    email: 'david.mutua@imaraworks.co.ke',
    target: '/manager/dashboard',
  },
  {
    name: 'Alice Mwangi',
    role: 'Employee',
    email: 'alice.mwangi@imaraworks.co.ke',
    target: '/employee',
  },
];

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = email.toLowerCase();
    if (l.includes('grace') || l.includes('admin')) {
      router.push('/admin/dashboard');
    } else if (l.includes('faith') || l.includes('finance')) {
      router.push('/finance/dashboard');
    } else if (l.includes('employee') || l.includes('alice') || l.includes('bernadette')) {
      router.push('/employee');
    } else {
      router.push('/manager/dashboard');
    }
  };

  const handleSelectDemo = (demo: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(demo.email);
    setPassword('password123');
    router.push(demo.target);
  };

  return (
    <div>
      <ForgotNotice show={showForgotNotice} />
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

      {/* Demo Accounts Quick-Access */}
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
                onClick={() => handleSelectDemo(acc)}
                className="w-full rounded-md border border-line p-2 text-left transition hover:border-brand hover:bg-brand/5 cursor-pointer"
              >
                <span className="block text-[13px] font-medium text-ink">
                  {acc.name}
                </span>
                <span className="block text-[11px] text-muted-ink">
                  {acc.role}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
