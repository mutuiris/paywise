'use client';

import React from 'react';
import { AppSidebar } from '@/components/common/AppSidebar';
import { DEMO_USERS } from '@/types/auth';

export interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  return (
    <AppSidebar
      role="ADMIN"
      basePath="/admin"
      user={DEMO_USERS.grace}
      mobileOpen={mobileOpen}
      onClose={onClose}
    />
  );
}
