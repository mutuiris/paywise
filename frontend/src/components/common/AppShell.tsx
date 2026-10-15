'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppShellProps } from './AppShell.types';

export type { AppShellProps };

export function AppShell({
  role,
  basePath,
  user,
  badges,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas  text-ink antialiased">
      <AppSidebar
        role={role}
        basePath={basePath}
        user={user}
        badges={badges}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
