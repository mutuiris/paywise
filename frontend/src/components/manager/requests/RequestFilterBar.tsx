'use client';

import React from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';
import { MOCK_VENDORS, MOCK_PROJECTS, formatCurrency } from '@/data/mock-manager-data';

export interface RequestFilterBarProps {
  search: string;
  statusFilter: string;
  projectFilter: string;
  vendorFilter: string;
  filteredCount: number;
  totalFilteredAmount: number;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onProjectChange: (val: string) => void;
  onVendorChange: (val: string) => void;
  onReset: () => void;
}

export function RequestFilterBar({
  search,
  statusFilter,
  projectFilter,
  vendorFilter,
  filteredCount,
  totalFilteredAmount,
  onSearchChange,
  onStatusChange,
  onProjectChange,
  onVendorChange,
  onReset,
}: RequestFilterBarProps) {
  const isFiltered =
    Boolean(search) ||
    statusFilter !== 'ALL' ||
    vendorFilter !== 'ALL' ||
    projectFilter !== 'ALL';

  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-xs space-y-3 font-serif">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
          <input
            type="text"
            placeholder="Search reference, vendor, invoice, reason…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-line bg-canvas/60 py-2 pl-9 pr-3 text-xs sm:text-sm text-ink placeholder:text-muted-ink focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-serif"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <label htmlFor="status-filter" className="sr-only">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full appearance-none rounded-md border border-line bg-surface pl-3 pr-8 py-2 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 font-serif cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
            <option value="PROCESSING">Processing</option>
            <option value="SUBMITTED">Submitted</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
        </div>

        {/* Project Filter */}
        <div className="relative">
          <label htmlFor="project-filter" className="sr-only">
            Project
          </label>
          <select
            id="project-filter"
            value={projectFilter}
            onChange={(e) => onProjectChange(e.target.value)}
            className="w-full appearance-none rounded-md border border-line bg-surface pl-3 pr-8 py-2 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 font-serif cursor-pointer"
          >
            <option value="ALL">All Projects</option>
            {MOCK_PROJECTS.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
        </div>

        {/* Vendor Filter */}
        <div className="relative">
          <label htmlFor="vendor-filter" className="sr-only">
            Vendor
          </label>
          <select
            id="vendor-filter"
            value={vendorFilter}
            onChange={(e) => onVendorChange(e.target.value)}
            className="w-full appearance-none rounded-md border border-line bg-surface pl-3 pr-8 py-2 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 font-serif cursor-pointer"
          >
            <option value="ALL">All Vendors</option>
            {MOCK_VENDORS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
        </div>
      </div>

      {/* Filter Summary & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-3 text-xs text-muted-ink">
        <div className="flex items-center gap-3">
          <span>
            Requests: <strong className="text-ink">{filteredCount}</strong>
          </span>
          <span>·</span>
          <span>
            Total Value:{' '}
            <strong className="text-ink font-serif">
              {formatCurrency(totalFilteredAmount)}
            </strong>
          </span>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-brand font-semibold hover:underline cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
