'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import { INITIAL_PAYMENT_REQUESTS } from '@/data/mock-manager-data';
import { RequestFilterBar } from './RequestFilterBar';
import { RequestsTable } from './RequestsTable';

export interface RequestsListProps {
  basePath?: string;
}

export function RequestsList({ basePath = '/manager' }: RequestsListProps = {}) {
  const [requests] = useState<PaymentRequestItem[]>(INITIAL_PAYMENT_REQUESTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtering
  const filtered = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (vendorFilter !== 'ALL' && r.vendorId !== vendorFilter) return false;
    if (projectFilter !== 'ALL' && r.project !== projectFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.reference.toLowerCase().includes(q) ||
        r.vendorName.toLowerCase().includes(q) ||
        r.invoiceNumber.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedRequests = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setVendorFilter('ALL');
    setProjectFilter('ALL');
    setCurrentPage(1);
  };

  const totalFilteredAmount = filtered.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Payment Requests
          </h1>
          <p className="mt-1 text-sm text-muted-ink">
            Track, filter, and review all vendor payment requisitions across project sites.
          </p>
        </div>

        {basePath !== '/finance' && basePath !== '/admin' && (
          <Link
            href={`${basePath}/requests/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>New Payment Request</span>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <RequestFilterBar
        search={search}
        statusFilter={statusFilter}
        projectFilter={projectFilter}
        vendorFilter={vendorFilter}
        filteredCount={filtered.length}
        totalFilteredAmount={totalFilteredAmount}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        onProjectChange={(val) => {
          setProjectFilter(val);
          setCurrentPage(1);
        }}
        onVendorChange={(val) => {
          setVendorFilter(val);
          setCurrentPage(1);
        }}
        onReset={resetFilters}
      />

      {/* Requests Table */}
      <RequestsTable
        requests={paginatedRequests}
        basePath={basePath}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
