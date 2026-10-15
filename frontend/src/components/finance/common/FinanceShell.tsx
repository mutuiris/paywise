'use client';

import React, { useState } from 'react';
import { FinanceSidebar } from './FinanceSidebar';
import { FinanceHeader } from './FinanceHeader';

export interface FinanceShellProps {
  children?: React.ReactNode;
}

export function FinanceShell({ children }: FinanceShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Finance Sidebar (Desktop + Mobile Drawer) */}
      <FinanceSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Finance Header */}
        <FinanceHeader onMenuClick={() => setMobileOpen(true)} />

        {/* Page Container */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
