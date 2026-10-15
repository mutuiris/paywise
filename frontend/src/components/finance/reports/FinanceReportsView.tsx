'use client';

import React from 'react';
import { FinanceReportsHeader } from './FinanceReportsHeader';
import { FinanceReportsStats } from './FinanceReportsStats';
import { FinanceDepartmentSpendTable } from './FinanceDepartmentSpendTable';

export function FinanceReportsView() {
  return (
    <div className="space-y-6">
      <FinanceReportsHeader />
      <FinanceReportsStats />
      <FinanceDepartmentSpendTable />
    </div>
  );
}
