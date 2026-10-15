<<<<<<< HEAD
import type { Metadata } from 'next';
import { ManagerShell } from '@/components/manager';

export const metadata: Metadata = {
  title: 'Manager — PayWise',
  description: 'Manager portal with sidebar, header and dashboard navigation.',
};
=======
import React, { Suspense } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { ManagerSidebar } from '@/components/manager/ManagerSidebar';
>>>>>>> origin/feature/manager-requests-vendors

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
  return <ManagerShell>{children}</ManagerShell>;
=======
  return (
    <div className="flex min-h-screen bg-canvas">
      <ManagerSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="sticky top-0 z-20 h-14 shrink-0 border-b border-line bg-surface"
            />
          }
        >
          <ManagerHeader />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
>>>>>>> origin/feature/manager-requests-vendors
}
