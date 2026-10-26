'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import { INITIAL_PAYMENT_REQUESTS } from '@/data/mock-manager-data';
import { paymentService } from '@/lib/api/services';
import { RequestFilterBar } from './RequestFilterBar';
import { RequestsTable } from './RequestsTable';

export interface RequestsListProps {
  basePath?: string;
}

export function RequestsList({ basePath = '/manager' }: RequestsListProps = {}) {
  const [requests, setRequests] = useState<PaymentRequestItem[]>(INITIAL_PAYMENT_REQUESTS);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchLiveRequests = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const res = await paymentService.listRequests();
      const list = Array.isArray(res) ? res : (res as any)?.results;
      if (list && list.length > 0) {
        const mapped: PaymentRequestItem[] = list.map((r: any) => ({
          id: r.id,
          reference: r.reference || r.invoice_number || `PR-${r.id.slice(0, 6).toUpperCase()}`,
          vendorId: r.vendorId || r.vendor_id,
          vendorName: r.vendorName || r.vendor_name || 'Designated Vendor',
          amount: typeof r.amount === 'number' ? r.amount : parseFloat(r.amount) || 0,
          currency: 'KES',
          invoiceNumber: r.invoiceNumber || r.invoice_number || `INV-${r.id.slice(0, 6).toUpperCase()}`,
          project: r.project || r.project_name || 'ImaraWorks Construction',
          requesterId: r.requesterId || r.requester_id || '',
          requesterName: r.requesterName || r.requester_username || 'Employee',
          paymentMethod: (r.paymentMethod || r.payment_method) === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
          requestedPaymentDate: r.createdAt || r.created_at || new Date().toISOString(),
          notes: r.notes || r.description || '',
          reason: r.reason || r.description || '',
          status: r.status,
          rejectionReason: r.rejectionReason || r.rejection_reason || undefined,
          createdAt: r.createdAt || r.created_at || new Date().toISOString(),
          updatedAt: r.updatedAt || r.updated_at || new Date().toISOString(),
        }));
        setRequests(mapped);
        setUsingFallback(false);
      } else {
        setUsingFallback(true);
      }
    } catch {
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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
            onClick={() => fetchLiveRequests(true)}
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

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3 text-xs text-muted-ink">
          <AlertCircle className="size-4 shrink-0 text-muted-ink" />
          <span>Backend payments endpoint unseeded or offline. Displaying demonstration requisitions.</span>
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
