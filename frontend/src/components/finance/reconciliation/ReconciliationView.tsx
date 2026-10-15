'use client';

import React from 'react';
import { ReconciliationHeader } from './ReconciliationHeader';
import { ReconciliationNotice } from './ReconciliationNotice';
import { ReconciliationStats } from './ReconciliationStats';
import { ReconciliationFilters } from './ReconciliationFilters';
import { ReconciliationTable } from './ReconciliationTable';
import { useReconciliation } from './useReconciliation';

export function ReconciliationView() {
  const {
    filtered,
    verifyingId,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    ambiguousCount,
    succeededCount,
    failedCount,
    handleVerify,
  } = useReconciliation();

  return (
    <div className="space-y-6">
      <ReconciliationHeader />
      <ReconciliationNotice />
      <ReconciliationStats
        ambiguousCount={ambiguousCount}
        succeededCount={succeededCount}
        failedCount={failedCount}
      />
      <div className="rounded-xl border border-line bg-surface shadow-2xs">
        <ReconciliationFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        <ReconciliationTable
          items={filtered}
          verifyingId={verifyingId}
          onVerify={handleVerify}
        />
      </div>
    </div>
  );
}
