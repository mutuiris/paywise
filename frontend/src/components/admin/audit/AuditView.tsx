'use client';

import React from 'react';
import { Pagination } from '../common/Pagination';
import { useAudit } from './useAudit';
import { AuditHeader } from './AuditHeader';
import { AuditFilters } from './AuditFilters';
import { AuditTable } from './AuditTable';

import { RefreshCw, AlertCircle } from 'lucide-react';

export function AuditView() {
  const {
    search, setSearch, actionFilter, setActionFilter,
    page, setPage, pageSize, total, actionsList,
    pagedEvents, loading, error, refreshEvents, handleClear,
  } = useAudit();

  return (
    <div className="space-y-4 font-serif">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <AuditHeader />
        <button
          type="button"
          onClick={refreshEvents}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition shadow-2xs"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Log</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

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
