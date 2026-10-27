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

export interface VendorDetailProps {
  vendorId: string;
  basePath?: string;
}

export function VendorDetail({ vendorId, basePath = '/manager' }: VendorDetailProps) {
  const fallbackVendor = MOCK_VENDORS.find((v) => v.id === vendorId) || MOCK_VENDORS[0];
  const [vendor, setVendor] = useState<VendorItem>(fallbackVendor);
  const [vendorRequests, setVendorRequests] = useState<PaymentRequestItem[]>(
    INITIAL_PAYMENT_REQUESTS.filter((r) => r.vendorId === fallbackVendor.id)
  );
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let ignore = false;

    Promise.allSettled([
      vendorService.getVendor(vendorId),
      paymentService.listRequests({ vendor: vendorId }),
    ])
      .then(([vRes, pRes]) => {
        if (ignore) return;
        let foundLiveVendor = false;

        if (vRes.status === 'fulfilled' && vRes.value) {
          const v = vRes.value;
          if (v && (v.id || v.name)) {
            const mappedVendor: VendorItem = {
              id: v.id || vendorId,
              name: v.name,
              service: v.service,
              contactName: v.contactName,
              contactEmail: v.contactEmail,
              contactPhone: v.contactPhone,
              payoutMethod: v.payoutMethod === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
              bankName: v.bankName,
              accountNumber: v.accountNumber,
              isActive: v.isActive,
              createdAt: v.createdAt,
            };
            setVendor(mappedVendor);
            foundLiveVendor = true;
          }
        }

        if (pRes.status === 'fulfilled' && pRes.value) {
          const list = pRes.value;
          if (list.length > 0) {
            const mappedRequests: PaymentRequestItem[] = list.map((r) => ({
              id: r.id,
              reference: r.reference,
              vendorId: r.vendorId,
              vendorName: r.vendorName || fallbackVendor.name,
              amount: r.amount,
              currency: 'KES',
              invoiceNumber: r.invoiceNumber,
              project: r.project,
              requesterId: r.requesterId,
              requesterName: r.requesterName,
              paymentMethod: r.paymentMethod === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
              requestedPaymentDate: r.createdAt,
              notes: r.notes || '',
              reason: r.reason,
              status: r.status,
              rejectionReason: r.rejectionReason,
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
            }));
            setVendorRequests(mappedRequests);
          }
        }

        setUsingFallback(!foundLiveVendor);
      })
      .catch(() => {
        if (ignore) return;
        setUsingFallback(true);
      });

    return () => {
      ignore = true;
    };
  }, [vendorId, fallbackVendor.name]);

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

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>Showing cached demonstration vendor profile (Backend server unreachable).</span>
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
