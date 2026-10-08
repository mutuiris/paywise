'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, CheckCircle2 } from 'lucide-react';
import {
  CURRENT_MANAGER,
  INITIAL_PAYMENT_REQUESTS,
  INITIAL_ACTIVITY_LOG,
  formatCurrency,
} from '@/data/mock-manager-data';
import { PaymentRequestItem, ActivityEvent } from '@/types/manager';
import { SummaryCard } from './SummaryCard';
import { PaymentRequestTable } from './PaymentRequestTable';
import { ApprovalModal } from './ApprovalModal';
import { RecentActivity } from './RecentActivity';

export function ManagerDashboard() {
  const [requests, setRequests] = useState<PaymentRequestItem[]>(INITIAL_PAYMENT_REQUESTS);
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_LOG);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute live KPIs
  const pendingRequests = requests.filter(
    (r) => r.status === 'PENDING_APPROVAL' || r.status === 'SUBMITTED'
  );
  const approvedToday = requests.filter((r) => r.status === 'APPROVED');
  const rejectedRequests = requests.filter((r) => r.status === 'REJECTED');
  const totalPendingCount = pendingRequests.length;

  const handleReview = (req: PaymentRequestItem) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleApprove = (requestId: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    const isDual = target.amount > CURRENT_MANAGER.approvalLimit;
    const nowIso = new Date().toISOString();

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status: 'APPROVED',
          updatedAt: nowIso,
          approvals: [
            ...(r.approvals || []).map((ap) =>
              ap.type === 'MANAGER'
                ? {
                    ...ap,
                    decision: 'APPROVED' as const,
                    approverId: CURRENT_MANAGER.id,
                    approverName: CURRENT_MANAGER.name,
                    decidedAt: nowIso,
                  }
                : ap
            ),
          ],
        };
      })
    );

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      at: nowIso,
      actorName: CURRENT_MANAGER.name,
      action: 'Approved payment',
      entity: 'PaymentRequest',
      requestReference: target.reference,
      description: `Manager approved ${target.reference} (${target.vendorName} — ${formatCurrency(target.amount)})${
        isDual ? ' · Routed to Finance for final approval' : ' · Ready for payout'
      }`,
    };

    setActivities((prev) => [newActivity, ...prev]);
    showToast(
      `✓ Successfully approved ${target.reference} (${target.vendorName})${
        isDual ? ' — Routed to Finance' : ''
      }`
    );
  };

  const handleReject = (requestId: string, reason: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    const nowIso = new Date().toISOString();

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status: 'REJECTED',
          updatedAt: nowIso,
          approvals: [
            ...(r.approvals || []).map((ap) =>
              ap.type === 'MANAGER'
                ? {
                    ...ap,
                    decision: 'REJECTED' as const,
                    approverId: CURRENT_MANAGER.id,
                    approverName: CURRENT_MANAGER.name,
                    decidedAt: nowIso,
                    reason,
                  }
                : ap
            ),
          ],
        };
      })
    );

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      at: nowIso,
      actorName: CURRENT_MANAGER.name,
      action: 'Rejected payment',
      entity: 'PaymentRequest',
      requestReference: target.reference,
      description: `Manager rejected ${target.reference}: "${reason}"`,
    };

    setActivities((prev) => [newActivity, ...prev]);
    showToast(`Payment request ${target.reference} has been rejected.`);
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-ok/30 bg-ok-light px-4 py-3 text-sm font-medium text-ok shadow-lg transition-all animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome back, {CURRENT_MANAGER.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-ink">
            Manager dashboard · {CURRENT_MANAGER.department}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/manager/requests"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="size-4" />
            <span>New Payment Request</span>
          </Link>
        </div>
      </div>

      {/* 4-Card Summary Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Awaiting My Approval"
          value={pendingRequests.length}
          tone="warn"
          hint="Needs your decision"
        />
        <SummaryCard
          label="Approved Today"
          value={approvedToday.length}
          tone="ok"
          hint="Processed by you today"
        />
        <SummaryCard
          label="Rejected"
          value={rejectedRequests.length}
          tone="err"
          hint="Declined requests"
        />
        <SummaryCard
          label="Total Pending"
          value={totalPendingCount}
          tone="neutral"
          hint="Across all projects"
        />
      </div>

      {/* Requests Awaiting Approval Table */}
      <PaymentRequestTable
        requests={pendingRequests}
        onReview={handleReview}
        title="Requests Awaiting Approval"
        showFilters={true}
      />

      {/* Recent Activity Feed */}
      <RecentActivity events={activities} />

      {/* Interactive Review / Decision Modal */}
      <ApprovalModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
