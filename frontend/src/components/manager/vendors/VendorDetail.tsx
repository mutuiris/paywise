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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    Promise.allSettled([
      vendorService.getVendor(vendorId),
      paymentService.listRequests({ vendor: vendorId }),
    ])
      .then(([vRes, pRes]) => {
        if (ignore) return;
        let foundLiveVendor = false;

        if (vRes.status === 'fulfilled' && vRes.value) {
          const raw: any = (vRes.value as any)?.vendor || vRes.value;
          if (raw && (raw.id || raw.name)) {
            const pd = raw.payment_details || {};
            const mappedVendor: VendorItem = {
              id: raw.id || vendorId,
              name: raw.name,
              service: raw.service || raw.service_category || 'Contractor',
              contactName: raw.contactName || raw.name,
              contactEmail: raw.contactEmail || raw.email || '',
              contactPhone: raw.contactPhone || raw.phone_number || '',
              payoutMethod:
                (raw.payoutMethod || pd.payout_method) === 'BANK' ? 'BANK' : 'MPESA',
              bankName: raw.bankName || pd.bank_name || undefined,
              accountNumber:
                raw.accountNumber || pd.account_number || pd.mpesa_number || undefined,
              isActive: raw.isActive ?? raw.is_active ?? true,
              createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
            };
            setVendor(mappedVendor);
            foundLiveVendor = true;
          }
        }

        if (pRes.status === 'fulfilled' && pRes.value) {
          const list: any[] = Array.isArray(pRes.value)
            ? pRes.value
            : (pRes.value as any)?.results || [];
          if (list.length > 0) {
            const mappedRequests: PaymentRequestItem[] = list.map((r: any) => ({
              id: r.id,
              reference: r.reference || r.invoice_number || `PR-${r.id.slice(0, 6).toUpperCase()}`,
              vendorId: r.vendorId || r.vendor_id,
              vendorName: r.vendorName || r.vendor_name || fallbackVendor.name,
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
            setVendorRequests(mappedRequests);
          }
        }

        setUsingFallback(!foundLiveVendor);
        setLoading(false);
      })
      .catch(() => {
        if (ignore) return;
        setUsingFallback(true);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [vendorId]);

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
