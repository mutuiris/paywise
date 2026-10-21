import React from 'react';
import { FilterBar } from '../common/FilterBar';

export interface AuditFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  actionFilter: string;
  onActionChange: (val: string) => void;
  actionsList: string[];
  totalCount: number;
  onClear: () => void;
}

export function AuditFilters({
  search, onSearchChange, actionFilter, onActionChange, actionsList, totalCount, onClear,
}: AuditFiltersProps) {
  return (
    <FilterBar
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Actor, request, description…"
      meta={`${totalCount} event${totalCount === 1 ? '' : 's'}`}
      onClear={search || actionFilter !== 'ALL' ? onClear : undefined}
    >
      <div className="flex items-center gap-1.5">
        <label htmlFor="audit-action-select" className="text-xs text-muted-ink whitespace-nowrap">Action:</label>
        <select
          id="audit-action-select"
          value={actionFilter}
          onChange={(e) => onActionChange(e.target.value)}
          className="rounded border border-line bg-surface px-2.5 py-1.5 text-xs text-ink focus:border-brand cursor-pointer"
        >
          <option value="ALL">All actions</option>
          {actionsList.map((act) => (
            <option key={act} value={act}>{act}</option>
          ))}
        </select>
      </div>
    </FilterBar>
  );
}
