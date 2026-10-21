'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/common/AppSidebar';
import { DEMO_USERS } from '@/types/auth';
import { getClientUser } from '@/lib/auth/session';

export interface ManagerSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function ManagerSidebar({ mobileOpen = false, onClose }: ManagerSidebarProps) {
  const [currentUser] = useState(() => {
    const session = getClientUser();
    if (session) {
      return {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        title: session.department ? `Operations · ${session.department}` : 'Manager',
        department: session.department || 'Operations',
        avatarInitials: session.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'CW',
        approvalLimit: session.approvalLimit || 50000,
      };
    }
    return DEMO_USERS.carol;
  });

  return (
    <AppSidebar
      role="MANAGER"
      basePath="/manager"
      user={currentUser}
      badges={{ approvals: 3 }}
      mobileOpen={mobileOpen}
      onClose={onClose}
    />
  );
}
