import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export interface FilterBarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  meta?: React.ReactNode;
  onClear?: () => void;
  children?: React.ReactNode;
}

export function FilterBar({
  searchValue, onSearchChange, searchPlaceholder = 'Search…', meta, onClear, children,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3 font-serif">
      <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-[240px]">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-line bg-canvas/60 py-1.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        {children}
        {onClear && (
          <button type="button" onClick={onClear} className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs text-muted-ink hover:text-ink cursor-pointer">
            <RotateCcw className="size-3" /><span>Clear</span>
          </button>
        )}
      </div>
      {meta && <div className="text-xs font-medium text-muted-ink">{meta}</div>}
    </div>
  );
}
