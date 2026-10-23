'use client';

import React from 'react';
import {
  MOCK_VENDORS,
  INITIAL_PAYMENT_REQUESTS,
  formatCurrency,
} from '@/data/mock-manager-data';
import { SummaryCard } from '../dashboard/SummaryCard';
import { VendorHeader } from './VendorHeader';
import { VendorProfileCard } from './VendorProfileCard';
import { VendorHistoryTable } from './VendorHistoryTable';

export interface VendorDetailProps {
  vendorId: string;
  basePath?: string;
}

export function VendorDetail({ vendorId, basePath = '/manager' }: VendorDetailProps) {
  const vendor = MOCK_VENDORS.find((v) => v.id === vendorId) || MOCK_VENDORS[0];
  const vendorRequests = INITIAL_PAYMENT_REQUESTS.filter((r) => r.vendorId === vendor.id);

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
