import React from 'react';
import { Search, Filter } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function ReconciliationFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-xs flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
        <input
          type="text"
          placeholder="Search reference or vendor…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-line bg-canvas/60 py-1.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted-ink/70 focus:border-brand focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-ink" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink focus:border-brand focus:outline-none"
        >
          <option value="ALL">All Outcomes</option>
          <option value="AMBIGUOUS">Unconfirmed Only</option>
          <option value="SUCCEEDED">Succeeded Only</option>
          <option value="FAILED">Failed Only</option>
        </select>
      </div>
    </div>
  );
}
