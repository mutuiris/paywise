import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-3 text-xs text-muted-ink font-serif">
      <p>Showing <span className="font-medium text-ink">{start}</span> to <span className="font-medium text-ink">{end}</span> of <span className="font-medium text-ink">{total}</span></p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="inline-flex size-7 items-center justify-center rounded border border-line bg-surface text-ink transition hover:bg-canvas disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="px-2 font-medium text-ink">Page {page} of {totalPages}</span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="inline-flex size-7 items-center justify-center rounded border border-line bg-surface text-ink transition hover:bg-canvas disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
