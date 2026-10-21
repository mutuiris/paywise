'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole } from '@/types/auth';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

export interface AppShellProps {
  role: UserRole;
  basePath: string;
  user: UserProfile;
  badges?: {
    approvals?: number;
    payments?: number;
    reconciliation?: number;
  };
  children: React.ReactNode;
}

export function AppShell({
  role,
  basePath,
  user,
  badges,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas text-ink antialiased">
      {/* Shared Responsive Sidebar */}
      <AppSidebar
        role={role}
        basePath={basePath}
        user={user}
        badges={badges}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
