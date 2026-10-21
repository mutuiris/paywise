'use client';

import React, { useState } from 'react';
import {
  Check,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/data/mock-manager-data';
import { RejectionModal } from '@/components/approvals/RejectionModal';
import { SummaryCard } from '@/components/common/SummaryCard';

export interface HighValueApproval {
  id: string;
  reference: string;
  vendorName: string;
  amount: number;
  invoiceNumber: string;
  reason: string;
  project: string;
  requesterName: string;
  managerApprovedBy: string;
  managerApprovedAt: string;
  status: 'PENDING_FINANCE' | 'APPROVED' | 'REJECTED';
}

const INITIAL_FINANCE_APPROVALS: HighValueApproval[] = [
  {
    id: 'pr2',
    reference: 'PR-000124',
    vendorName: 'SwiftHaul Logistics',
    amount: 67000,
    invoiceNumber: 'SH-820',
    reason: 'Heavy material transport & flatbed haulage for bridge steel beams',
    project: 'Thika Road Bridge',
    requesterName: 'Brian Otieno',
    managerApprovedBy: 'Carol Wanjiku',
    managerApprovedAt: '2026-10-08T11:00:00Z',
    status: 'PENDING_FINANCE',
  },
  {
    id: 'pr3',
    reference: 'PR-000125',
    vendorName: 'Apex Electricals',
    amount: 148000,
    invoiceNumber: 'AE-4103',
    reason: 'Substation cabling, phase 1 electrical installation & switchgear',
    project: 'Nairobi HQ Tower',
    requesterName: 'Brian Otieno',
    managerApprovedBy: 'David Mutua',
    managerApprovedAt: '2026-10-08T10:15:00Z',
    status: 'PENDING_FINANCE',
  },
];

export function FinanceApprovalsView() {
  const [items, setItems] = useState<HighValueApproval[]>(INITIAL_FINANCE_APPROVALS);
  const [rejectingItem, setRejectingItem] = useState<HighValueApproval | null>(null);

  const pendingItems = items.filter((i) => i.status === 'PENDING_FINANCE');
  const totalPendingAmount = pendingItems.reduce((acc, i) => acc + i.amount, 0);

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'APPROVED' } : i))
    );
  };

  const handleRejectConfirm = (_reason: string) => {
    void _reason;
    if (!rejectingItem) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === rejectingItem.id ? { ...i, status: 'REJECTED' } : i
      )
    );
    setRejectingItem(null);
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Dual Sign-offs (&gt; KES 50k)
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Secondary authorizations for payments exceeding KES 50,000. Verified after departmental approval.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Pending Secondary Sign-off"
          value={pendingItems.length}
          hint="Department manager approved"
          tone="warn"
        />
        <SummaryCard
          label="Awaiting Authorization Value"
          value={formatCurrency(totalPendingAmount)}
          hint="Requires dual authorization"
          tone="brand"
        />
        <SummaryCard
          label="Compliance Rule"
          value="> KES 50,000"
          hint="No self-approvals permitted"
          tone="neutral"
        />
      </div>

      {/* Pending Approvals Table */}
      <div className="rounded-xl border border-line bg-surface shadow-2xs">
        <div className="border-b border-line p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">
              Queue for Finance Review ({pendingItems.length})
            </h2>
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand-deep">
              Finance Clearance Required
            </span>
          </div>
        </div>

        {pendingItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-ink">
            No pending dual sign-offs. All high-value requests authorized.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition hover:bg-canvas/40"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-[13px] font-semibold text-brand-deep">
                      {item.reference}
                    </span>
                    <span className="rounded-xs bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-muted-ink font-serif">
                      {item.project}
                    </span>
                    <span className="font-serif text-xs text-muted-ink">
                      Invoice: {item.invoiceNumber}
                    </span>
                  </div>
                  <p className="text-base font-bold text-ink">{item.vendorName}</p>
                  <p className="text-xs text-muted-ink">{item.reason}</p>
                  <p className="text-[11px] text-muted-ink">
                    Requested by <span className="font-medium text-ink">{item.requesterName}</span> · First clearance by{' '}
                    <span className="font-medium text-ink">{item.managerApprovedBy}</span> on{' '}
                    {formatDate(item.managerApprovedAt)}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <span className="font-serif text-xl font-bold tabular-nums text-ink">
                    {formatCurrency(item.amount)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectingItem(item)}
                      className="inline-flex items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-err hover:bg-err/5 cursor-pointer transition"
                    >
                      <X className="size-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(item.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-brand px-3.5 py-1.5 text-xs font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition shadow-2xs"
                    >
                      <Check className="size-3.5" />
                      <span>Approve to Payout</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Rejection Reason Modal */}
      {rejectingItem && (
        <RejectionModal
          requestId={rejectingItem.reference}
          vendorName={rejectingItem.vendorName}
          onClose={() => setRejectingItem(null)}
          onSubmit={handleRejectConfirm}
        />
      )}
    </div>
  );
}
