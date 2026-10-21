'use client';

import React, { useState } from 'react';
import { CURRENT_MANAGER, INITIAL_PAYMENT_REQUESTS } from '@/data/mock-manager-data';
import { PaymentRequestItem } from '@/types/manager';
import { ManagerApprovalsHeader } from './ManagerApprovalsHeader';
import { ManagerApprovalsStats } from './ManagerApprovalsStats';
import { ManagerApprovalsTable } from './ManagerApprovalsTable';
import { RejectionModal } from '@/components/approvals/RejectionModal';

export function ManagerApprovalsView() {
  const [requests, setRequests] = useState<PaymentRequestItem[]>(INITIAL_PAYMENT_REQUESTS);
  const [rejectingRequest, setRejectingRequest] = useState<PaymentRequestItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pending = requests.filter((r) => r.status === 'PENDING_APPROVAL' || r.status === 'SUBMITTED');
  const pendingAmount = pending.reduce((sum, r) => sum + r.amount, 0);
  const dualCount = pending.filter((r) => r.amount > CURRENT_MANAGER.approvalLimit).length;

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3500); };
  const handleApprove = (req: PaymentRequestItem) => {
    setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: 'APPROVED', updatedAt: new Date().toISOString() } : r)));
    showToast(`✓ Approved ${req.reference} (${req.vendorName})`);
  };
  const handleRejectSubmit = (reason: string) => {
    if (!rejectingRequest) return;
    setRequests((prev) => prev.map((r) => (r.id === rejectingRequest.id ? { ...r, status: 'REJECTED', updatedAt: new Date().toISOString() } : r)));
    showToast(`Rejected ${rejectingRequest.reference}: ${reason}`);
    setRejectingRequest(null);
  };

  return (
    <div className="space-y-6">
      {toastMessage && <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-ink px-4 py-3 text-xs font-semibold text-surface shadow-lg">{toastMessage}</div>}
      <ManagerApprovalsHeader />
      <ManagerApprovalsStats pendingCount={pending.length} pendingAmount={pendingAmount} dualCount={dualCount} />
      <ManagerApprovalsTable requests={pending} onApprove={handleApprove} onReject={setRejectingRequest} />
      {rejectingRequest && <RejectionModal requestId={rejectingRequest.reference} vendorName={rejectingRequest.vendorName} onClose={() => setRejectingRequest(null)} onSubmit={handleRejectSubmit} />}
    </div>
  );
}
