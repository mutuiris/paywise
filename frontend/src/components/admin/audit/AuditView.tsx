'use client';

import React from 'react';
import { Pagination } from '../common/Pagination';
import { useAudit } from './useAudit';
import { AuditHeader } from './AuditHeader';
import { AuditFilters } from './AuditFilters';
import { AuditTable } from './AuditTable';

export function AuditView() {
  const {
    search, setSearch, actionFilter, setActionFilter,
    page, setPage, pageSize, total, actionsList,
    pagedEvents, handleClear,
  } = useAudit();

  return (
    <div className="space-y-4 font-serif">
      <AuditHeader />
      <AuditFilters
        search={search}
        onSearchChange={setSearch}
        actionFilter={actionFilter}
        onActionChange={setActionFilter}
        actionsList={actionsList}
        totalCount={total}
        onClear={handleClear}
      />
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-2xs">
        <AuditTable events={pagedEvents} />
        {total > pageSize && (
          <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
        )}
      </div>
    </div>
  );
}
