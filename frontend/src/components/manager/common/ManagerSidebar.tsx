'use client';

import React from 'react';
import { AppSidebar } from '@/components/common/AppSidebar';
import { DEMO_USERS } from '@/types/auth';

export interface ManagerSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function ManagerSidebar({ mobileOpen = false, onClose }: ManagerSidebarProps) {
  return (
    <AppSidebar
      role="MANAGER"
      basePath="/manager"
      user={DEMO_USERS.carol}
      badges={{ approvals: 3 }}
      mobileOpen={mobileOpen}
      onClose={onClose}
    />
  );
}
