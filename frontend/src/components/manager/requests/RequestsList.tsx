'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import { INITIAL_PAYMENT_REQUESTS } from '@/data/mock-manager-data';
import { paymentService } from '@/lib/api/services';
import { DEMO_MODE } from '@/lib/config';
import { toRequestItem } from '../common/mapPaymentRequest';
import { RequestFilterBar } from './RequestFilterBar';
import { RequestsTable } from './RequestsTable';

export interface RequestsListProps {
  basePath?: string;
}

export function RequestsList({ basePath = '/manager' }: RequestsListProps = {}) {
  const [requests, setRequests] = useState<PaymentRequestItem[]>(
    DEMO_MODE ? INITIAL_PAYMENT_REQUESTS : []
  );
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchLiveRequests = useCallback(async () => {
    if (DEMO_MODE) return;
    setLoading(true);
    try {
      const res = await paymentService.listRequests({ limit: '500' });
      setRequests((res.results ?? []).map(toRequestItem));
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load payment requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    fetchLiveRequests();
  }, [fetchLiveRequests]);

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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchLiveRequests()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-xs font-medium text-ink hover:bg-canvas transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {basePath !== '/finance' && basePath !== '/admin' && (
            <Link
              href={`${basePath}/requests/new`}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="size-4" />
              <span>New Payment Request</span>
            </Link>
          )}
        </div>
      </div>

      {DEMO_MODE && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3 text-xs text-muted-ink">
          <AlertCircle className="size-4 shrink-0 text-muted-ink" />
          <span>Demo mode: showing sample requisitions. Nothing is read from the backend.</span>
        </div>
      )}

      {loadError && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-err/30 bg-err-light p-3 text-xs text-err">
          <AlertCircle className="size-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

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
