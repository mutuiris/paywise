'use client';

import React, { useState } from 'react';
import { PendingFinanceApproval, MOCK_FINANCE_APPROVALS } from './types';
import { FinanceApprovalsHeader } from './FinanceApprovalsHeader';
import { FinanceApprovalsStats } from './FinanceApprovalsStats';
import { FinanceApprovalItem } from './FinanceApprovalItem';
import { RejectionModal } from '@/components/approvals/RejectionModal';

export function FinanceApprovalsView() {
  const [items, setItems] = useState<PendingFinanceApproval[]>(MOCK_FINANCE_APPROVALS);
  const [rejectingItem, setRejectingItem] = useState<PendingFinanceApproval | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };
  const handleApprove = (item: PendingFinanceApproval) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    showToast(`✓ Dual approval recorded for ${item.reference}. Queued for disbursement.`);
  };
  const handleRejectSubmit = (reason: string) => {
    if (!rejectingItem) return;
    setItems((prev) => prev.filter((i) => i.id !== rejectingItem.id));
    showToast(`Rejected ${rejectingItem.reference}: ${reason}`);
    setRejectingItem(null);
  };

  return (
    <div className="space-y-6 font-serif">
      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-ink px-4 py-3 text-xs font-semibold text-surface shadow-lg">{toast}</div>}
      <FinanceApprovalsHeader />
      <FinanceApprovalsStats pendingCount={items.length} totalPendingAmount={items.reduce((s, i) => s + i.amount, 0)} />
      <div className="rounded-xl border border-line bg-surface shadow-2xs divide-y divide-line overflow-hidden">
        <div className="p-5 bg-surface-subtle">
          <h2 className="text-base font-semibold text-ink">Requisitions Pending Secondary Clearance ({items.length})</h2>
          <p className="text-xs text-muted-ink">Manager approved. Awaiting final Finance authorization.</p>
        </div>
        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-ink">No requests currently awaiting dual approval.</div>
        ) : (
          items.map((item) => <FinanceApprovalItem key={item.id} item={item} onApprove={handleApprove} onReject={setRejectingItem} />)
        )}
      </div>
      {rejectingItem && <RejectionModal requestId={rejectingItem.reference} vendorName={rejectingItem.vendorName} onClose={() => setRejectingItem(null)} onSubmit={handleRejectSubmit} />}
    </div>
  );
}
