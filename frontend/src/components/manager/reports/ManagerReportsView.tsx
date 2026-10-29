'use client';

import React from 'react';
import { ManagerReportsHeader } from './ManagerReportsHeader';
import { ManagerReportsStats } from './ManagerReportsStats';
import { ManagerDepartmentSpendTable } from './ManagerDepartmentSpendTable';
import { Database } from 'lucide-react';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function ManagerReportsView() {
  return (
    <div className="space-y-6">
      <ManagerReportsHeader />

      {DEMO_MODE ? (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <Database className="size-4 shrink-0" />
          <span>
            <strong className="font-semibold">Demo data.</strong> Sample records are shown because
            NEXT_PUBLIC_DEMO_MODE is enabled. Nothing is read from or written to a backend in this
            mode.
          </span>
        </div>
      ) : null}

      <ManagerReportsStats />
      <ManagerDepartmentSpendTable />
    </div>
  );
}
