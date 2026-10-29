'use client';

import React, { useState, useEffect } from 'react';
import {
  MOCK_VENDORS,
  INITIAL_PAYMENT_REQUESTS,
  formatCurrency,
} from '@/data/mock-manager-data';
import { SummaryCard } from '../dashboard/SummaryCard';
import { VendorHeader } from './VendorHeader';
import { VendorProfileCard } from './VendorProfileCard';
import { VendorHistoryTable } from './VendorHistoryTable';
import { VendorItem, PaymentRequestItem } from '@/types/manager';
import { vendorService, paymentService } from '@/lib/api/services';
import { AlertCircle } from 'lucide-react';
import { DEMO_MODE } from '@/lib/config';
import { toPaymentMethod, toRequestItem } from '../common/mapPaymentRequest';

export interface VendorDetailProps {
  vendorId: string;
  basePath?: string;
}

export function VendorDetail({ vendorId, basePath = '/manager' }: VendorDetailProps) {
  const [vendor, setVendor] = useState<VendorItem | null>(
    DEMO_MODE ? MOCK_VENDORS.find((v) => v.id === vendorId) ?? null : null
  );
  const [vendorRequests, setVendorRequests] = useState<PaymentRequestItem[]>(
    DEMO_MODE ? INITIAL_PAYMENT_REQUESTS.filter((r) => r.vendorId === vendorId) : []
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE) return;
    let ignore = false;

    Promise.allSettled([
      vendorService.getVendor(vendorId),
      paymentService.listRequests({ vendor_id: vendorId, limit: '500' }),
    ]).then(([vRes, pRes]) => {
      if (ignore) return;

      if (vRes.status === 'fulfilled') {
        const v = vRes.value;
        setVendor({
          id: v.id || vendorId,
          name: v.name,
          service: v.service,
          contactName: v.contactName,
          contactEmail: v.contactEmail,
          contactPhone: v.contactPhone,
          payoutMethod: toPaymentMethod(v.payoutMethod),
          bankName: v.bankName,
          accountNumber: v.accountNumber,
          isActive: v.isActive,
          createdAt: v.createdAt,
        });
      } else {
        const err = vRes.reason;
        setLoadError(err instanceof Error ? err.message : 'Unable to load this vendor.');
      }

      if (pRes.status === 'fulfilled') {
        setVendorRequests((pRes.value.results ?? []).map(toRequestItem));
      }
    });

    return () => {
      ignore = true;
    };
  }, [vendorId]);

  if (!vendor) {
    return (
      <div className="space-y-4 font-serif max-w-6xl mx-auto pb-12">
        {loadError ? (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-err/30 bg-err-light p-3 text-xs text-err">
            <AlertCircle className="size-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        ) : (
          <p className="text-sm text-muted-ink">Loading vendor…</p>
        )}
      </div>
    );
  }

  const totalPaid = vendorRequests
    .filter((r) => r.status === 'PAID')
    .reduce((acc, r) => acc + r.amount, 0);

  const pendingRequests = vendorRequests.filter((r) =>
    ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING'].includes(r.status)
  );

  return (
    <div className="space-y-6 font-serif max-w-6xl mx-auto pb-12">
      {/* 1. Header & Navigation */}
      <VendorHeader vendor={vendor} basePath={basePath} />

      {DEMO_MODE && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>Demo mode: showing a sample vendor profile. Nothing is read from the backend.</span>
        </div>
      )}

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Disbursed"
          value={formatCurrency(totalPaid)}
          tone="ok"
          hint="Completed payouts"
        />
        <SummaryCard
          label="Outstanding Requests"
          value={pendingRequests.length}
          tone="warn"
          hint="Pending approval/processing"
        />
        <SummaryCard
          label="All-Time Requisitions"
          value={vendorRequests.length}
          tone="neutral"
          hint="Total historical records"
        />
      </div>

      {/* 3. Vendor Profile (Contact & Payout Info) */}
      <VendorProfileCard vendor={vendor} />

      {/* 4. Payment History Table */}
      <VendorHistoryTable
        vendorName={vendor.name}
        vendorRequests={vendorRequests}
        basePath={basePath}
      />
    </div>
  );
}
