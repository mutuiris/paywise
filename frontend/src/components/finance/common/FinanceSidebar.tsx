'use client';

import React from 'react';
import { AppSidebar } from '@/components/common/AppSidebar';
import { DEMO_USERS } from '@/types/auth';

export interface FinanceSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function FinanceSidebar({
  mobileOpen = false,
  onClose,
}: FinanceSidebarProps) {
  return (
    <AppSidebar
      role="FINANCE"
      basePath="/finance"
      user={DEMO_USERS.faith}
      badges={{
        approvals: 2,
        payments: 2,
        reconciliation: 1,
      }}
      mobileOpen={mobileOpen}
      onClose={onClose}
    />
  );
}
