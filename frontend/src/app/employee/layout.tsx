'use client';

import React, { Suspense } from 'react';
import EmployeeSidebar from '@/components/employee/EmployeeSidebar';
import EmployeeHeader from '@/components/employee/EmployeeHeader';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <EmployeeSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Suspense
          fallback={<div className="h-16 bg-white border-b border-gray-200 shrink-0" />}
        >
          <EmployeeHeader />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
