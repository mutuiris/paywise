'use client';

import React, { useState } from 'react';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import { SubmitButton } from './SubmitButton';
import { ForgotNotice } from './ForgotNotice';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    </div>
  );
}
