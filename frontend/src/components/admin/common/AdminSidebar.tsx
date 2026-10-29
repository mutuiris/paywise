'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/common/AppSidebar';
import { DEMO_USERS } from '@/types/auth';
import { getClientUser } from '@/lib/auth/session';

export interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  const [currentUser] = useState(() => {
    const session = getClientUser();
    if (session) {
      return {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        title: session.department ? `Administrator · ${session.department}` : 'System Administrator',
        department: session.department || 'Administration',
        avatarInitials: session.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'SA',
        approvalLimit: session.approvalLimit,
      };
    }
    return DEMO_USERS.grace;
  });

  return (
    <AppSidebar
      role="ADMIN"
      basePath="/admin"
      user={currentUser}
      mobileOpen={mobileOpen}
      onClose={onClose}
    />
  );
}
