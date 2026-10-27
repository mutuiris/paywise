'use client';

import React, { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/common/AppSidebar';
import { DEMO_USERS } from '@/types/auth';
import { getClientUser, getInitials } from '@/lib/auth/session';
import { approvalService } from '@/lib/api/services';

export interface ManagerSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function ManagerSidebar({ mobileOpen = false, onClose }: ManagerSidebarProps) {
  const session = getClientUser();
  const currentUser = session
    ? {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        title: session.department ? `Operations · ${session.department}` : 'Manager',
        department: session.department || 'Operations',
        avatarInitials: getInitials(session.name, 'CW'),
        approvalLimit: session.approvalLimit || 50000,
      }
    : DEMO_USERS.carol;

  // The badge counts the requests this user can actually act on, so it follows
  // the approval tier of the signed-in role instead of a fixed number.
  const [approvalsCount, setApprovalsCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    const role = getClientUser()?.role;
    const tier = role === 'FINANCE' ? 'FINANCE' : role === 'ADMIN' ? undefined : 'MANAGER';

    approvalService
      .getQueue(tier ? { tier } : {})
      .then((res) => {
        if (!ignore) setApprovalsCount(res.results?.length ?? 0);
      })
      .catch(() => {
        if (!ignore) setApprovalsCount(0);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AppSidebar
      role="MANAGER"
      basePath="/manager"
      user={currentUser}
      badges={{ approvals: approvalsCount }}
      mobileOpen={mobileOpen}
      onClose={onClose}
    />
  );
}
