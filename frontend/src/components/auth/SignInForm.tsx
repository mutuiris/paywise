'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import { SubmitButton } from './SubmitButton';
import { ForgotNotice } from './ForgotNotice';
import { DemoAccountsPicker, DemoAccount } from './DemoAccountsPicker';

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFin = email.toLowerCase().includes('faith') || email.toLowerCase().includes('finance');
    router.push(isFin ? '/finance/dashboard' : '/manager/dashboard');
  };

  const handleSelectDemo = (demo: DemoAccount) => {
    setEmail(demo.email);
    setPassword('paywise');
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
      <DemoAccountsPicker onSelect={handleSelectDemo} />
    </div>
  );
}
