'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AppHeader } from '@/components/common/AppHeader';
import { DEMO_USERS } from '@/types/auth';

export interface AdminShellProps {
  children?: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas font-serif text-ink antialiased">
      {/* Admin Sidebar (Desktop + Mobile Drawer) */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col font-serif">
        {/* Admin Header */}
        <AppHeader
          user={DEMO_USERS.grace}
          notificationCount={2}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page Container */}
        <main className="flex-1 p-6 font-serif">
          {children}
        </main>
      </div>
    </div>
  );
}

