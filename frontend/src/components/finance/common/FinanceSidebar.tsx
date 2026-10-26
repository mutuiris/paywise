'use client';

import React from 'react';
import { AppSidebar } from '@/components/common/AppSidebar';
import { DEMO_USERS } from '@/types/auth';
import { getClientUser } from '@/lib/auth/session';

export interface FinanceSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function FinanceSidebar({
  mobileOpen = false,
  onClose,
}: FinanceSidebarProps) {
  const [currentUser] = React.useState(() => {
    const session = getClientUser();
    if (session) {
      return {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        title: session.department ? `Finance · ${session.department}` : 'Finance Officer',
        department: session.department || 'Finance',
        avatarInitials: session.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'FO',
        approvalLimit: session.approvalLimit,
      };
    }
    return DEMO_USERS.faith;
  });

  return (
    <AppSidebar
      role="FINANCE"
      basePath="/finance"
      user={currentUser}
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
