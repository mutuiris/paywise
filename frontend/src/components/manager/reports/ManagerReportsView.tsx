'use client';

import React from 'react';
import { ManagerReportsHeader } from './ManagerReportsHeader';
import { ManagerReportsStats } from './ManagerReportsStats';
import { ManagerDepartmentSpendTable } from './ManagerDepartmentSpendTable';

export function ManagerReportsView() {
  return (
    <div className="space-y-6 font-serif">
      <ManagerReportsHeader />
      <ManagerReportsStats />
      <ManagerDepartmentSpendTable />
    </div>
  );
}
