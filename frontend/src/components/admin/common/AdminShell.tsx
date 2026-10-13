'use client';

import React from 'react';
import { AppShell } from '@/components/common/AppShell';
import { DEMO_USERS } from '@/types/auth';

export interface AdminShellProps {
  children?: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <AppShell
      role="ADMIN"
      basePath="/admin"
      user={DEMO_USERS.grace}
    >
      {children}
    </AppShell>
  );
}
