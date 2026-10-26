'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import {
  MOCK_VENDORS,
  INITIAL_PAYMENT_REQUESTS,
} from '@/data/mock-manager-data';
import { VendorItem } from '@/types/manager';
import { vendorService } from '@/lib/api/services';
import { VendorsOverviewStats } from './VendorsOverviewStats';
import { VendorsTable, VendorWithStats } from './VendorsTable';

export interface VendorsListProps {
  basePath?: string;
}

export function VendorsList({ basePath = '/manager' }: VendorsListProps = {}) {
  const [vendors, setVendors] = useState<VendorItem[]>(MOCK_VENDORS);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [search, setSearch] = useState('');

  const fetchLiveVendors = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const res = await vendorService.listVendors();
      const list = Array.isArray(res) ? res : (res as any)?.vendors;
      if (list && list.length > 0) {
        const mapped: VendorItem[] = list.map((v: any) => {
          const pd = v.payment_details || {};
          return {
            id: v.id,
            name: v.name,
            service: v.service || v.service_category || 'Contractor',
            contactName: v.contactName || v.name,
            contactEmail: v.contactEmail || v.email || '',
            contactPhone: v.contactPhone || v.phone_number || '',
            payoutMethod: (v.payoutMethod || pd.payout_method) === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
            bankName: v.bankName || pd.bank_name,
            accountNumber: v.accountNumber || pd.account_number || pd.mpesa_number,
            isActive: v.isActive ?? v.is_active ?? true,
            createdAt: v.createdAt || v.created_at || new Date().toISOString(),
          };
        });
        setVendors(mapped);
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
    fetchLiveVendors();
  }, [fetchLiveVendors]);

  // Calculate dynamic stats for each vendor
  const vendorStats: VendorWithStats[] = vendors.map((v) => {
    const vendorRequests = INITIAL_PAYMENT_REQUESTS.filter((r) => r.vendorId === v.id);
    const totalPaid = vendorRequests
      .filter((r) => r.status === 'PAID')
      .reduce((acc, r) => acc + r.amount, 0);
    const pendingCount = vendorRequests.filter((r) =>
      ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING'].includes(r.status)
    ).length;

    return {
      ...v,
      requestCount: vendorRequests.length,
      pendingCount,
      totalPaid,
    };
  });

  const filteredVendors = vendorStats.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.service.toLowerCase().includes(q) ||
      v.contactName.toLowerCase().includes(q) ||
      v.contactEmail.toLowerCase().includes(q) ||
      (v.bankName && v.bankName.toLowerCase().includes(q))
    );
  });

  const totalCumulativePaid = vendorStats.reduce((acc, v) => acc + v.totalPaid, 0);
  const activeVendors = vendorStats.filter((v) => v.isActive).length;

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Registered Vendors
          </h1>
          <p className="mt-1 text-sm text-muted-ink">
            Approved suppliers and service contractors paid through PayWise.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLiveVendors(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3 text-xs text-muted-ink">
          <AlertCircle className="size-4 shrink-0 text-muted-ink" />
          <span>Backend vendors endpoint unseeded or offline. Displaying demonstration vendor registry.</span>
        </div>
      )}

      {/* Overview Stats */}
      <VendorsOverviewStats
        totalVendors={vendorStats.length}
        activeVendors={activeVendors}
        totalCumulativePaid={totalCumulativePaid}
        totalRequisitions={INITIAL_PAYMENT_REQUESTS.length}
      />

      {/* Vendors Table Card */}
      <section className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs">
        {/* Search Bar Header */}
        <div className="border-b border-line p-4 bg-surface">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
            <input
              type="text"
              placeholder="Search vendors by name, service, contact person…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-line bg-canvas/60 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted-ink focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-serif"
            />
          </div>
        </div>

        <VendorsTable vendors={filteredVendors} basePath={basePath} />
      </section>
    </div>
  );
}
