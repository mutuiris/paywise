'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import {
  MOCK_VENDORS,
  INITIAL_PAYMENT_REQUESTS,
} from '@/data/mock-manager-data';
import { PaymentRequestItem, VendorItem } from '@/types/manager';
import { paymentService, vendorService } from '@/lib/api/services';
import { DEMO_MODE } from '@/lib/config';
import { toPaymentMethod, toRequestItem } from '../common/mapPaymentRequest';
import { Vendor } from '@/lib/api/types';
import { VendorsOverviewStats } from './VendorsOverviewStats';
import { VendorsTable, VendorWithStats } from './VendorsTable';

export interface VendorsListProps {
  basePath?: string;
}

export function VendorsList({ basePath = '/manager' }: VendorsListProps = {}) {
  const [vendors, setVendors] = useState<VendorItem[]>(DEMO_MODE ? MOCK_VENDORS : []);
  const [requests, setRequests] = useState<PaymentRequestItem[]>(
    DEMO_MODE ? INITIAL_PAYMENT_REQUESTS : []
  );
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const mapVendor = useCallback((v: Vendor | Record<string, unknown>): VendorItem => {
    const raw = v as Record<string, unknown>;
    const pd = (typeof raw.payment_details === 'object' && raw.payment_details ? raw.payment_details : {}) as Record<string, unknown>;
    return {
      id: String(raw.id || ''),
      name: String(raw.name || ''),
      service: String(raw.service || raw.service_category || 'Contractor'),
      contactName: String(raw.contactName || raw.name || ''),
      contactEmail: String(raw.contactEmail || raw.email || ''),
      contactPhone: String(raw.contactPhone || raw.phone_number || ''),
      payoutMethod: toPaymentMethod(String(raw.payoutMethod || pd.payout_method || '')),
      bankName: typeof raw.bankName === 'string' ? raw.bankName : typeof pd.bank_name === 'string' ? pd.bank_name : undefined,
      accountNumber:
        typeof raw.accountNumber === 'string'
          ? raw.accountNumber
          : typeof pd.account_number === 'string'
          ? pd.account_number
          : typeof pd.mpesa_number === 'string'
          ? pd.mpesa_number
          : undefined,
      isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
      createdAt: String(raw.createdAt || raw.created_at || new Date().toISOString()),
    };
  }, []);

  const fetchLiveVendors = useCallback(async () => {
    if (DEMO_MODE) return;
    setLoading(true);
    const [vendorRes, requestRes] = await Promise.allSettled([
      vendorService.listVendors(),
      paymentService.listRequests({ limit: '500' }),
    ]);
    if (vendorRes.status === 'fulfilled') {
      setVendors(vendorRes.value.map(mapVendor));
      setLoadError(null);
    } else {
      const err = vendorRes.reason;
      setLoadError(err instanceof Error ? err.message : 'Unable to load vendors.');
    }
    if (requestRes.status === 'fulfilled') {
      setRequests((requestRes.value.results ?? []).map(toRequestItem));
    }
    setLoading(false);
  }, [mapVendor]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    fetchLiveVendors();
  }, [fetchLiveVendors]);

  // Calculate dynamic stats for each vendor
  const vendorStats: VendorWithStats[] = vendors.map((v) => {
    const vendorRequests = requests.filter((r) => r.vendorId === v.id);
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
          onClick={() => fetchLiveVendors()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {DEMO_MODE && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3 text-xs text-muted-ink">
          <AlertCircle className="size-4 shrink-0 text-muted-ink" />
          <span>Demo mode: showing a sample vendor registry. Nothing is read from the backend.</span>
        </div>
      )}

      {loadError && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-err/30 bg-err-light p-3 text-xs text-err">
          <AlertCircle className="size-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Overview Stats */}
      <VendorsOverviewStats
        totalVendors={vendorStats.length}
        activeVendors={activeVendors}
        totalCumulativePaid={totalCumulativePaid}
        totalRequisitions={requests.length}
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
