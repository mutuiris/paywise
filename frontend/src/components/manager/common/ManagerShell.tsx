'use client';

import React, { useState } from 'react';
import { ManagerSidebar } from './ManagerSidebar';
import { ManagerHeader } from './ManagerHeader';

interface ManagerShellProps {
  children?: React.ReactNode;
}

export function ManagerShell({ children }: ManagerShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas font-serif">
      {/* Manager Sidebar (Desktop + Mobile Drawer) */}
      <ManagerSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col font-serif">
        {/* Manager Header */}
        <ManagerHeader onMenuClick={() => setMobileOpen(true)} />

        {/* Page Container */}
        <main className="flex-1 p-6 font-serif">
          {children}
        </main>
      </div>
    </div>
  );
}
