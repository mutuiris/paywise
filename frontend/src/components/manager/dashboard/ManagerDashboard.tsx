'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import {
  INITIAL_PAYMENT_REQUESTS,
  INITIAL_ACTIVITY_LOG,
  formatCurrency,
  getApprovalRoute,
} from '@/data/mock-manager-data';
import { PaymentRequestItem, ActivityEvent } from '@/types/manager';
import { SummaryCard } from './SummaryCard';
import { PaymentRequestTable } from './PaymentRequestTable';
import { ApprovalModal } from './ApprovalModal';
import { RecentActivity } from './RecentActivity';
import { approvalService, paymentService, auditService } from '@/lib/api/services';
import { getClientUser } from '@/lib/auth/session';
import { DEMO_MODE } from '@/lib/config';
import { toActivityEvent, toRequestItem } from '../common/mapPaymentRequest';

export function ManagerDashboard() {
  const [currentUser] = useState(() => getClientUser());
  const [requests, setRequests] = useState<PaymentRequestItem[]>(
    DEMO_MODE ? INITIAL_PAYMENT_REQUESTS : []
  );
  const [activities, setActivities] = useState<ActivityEvent[]>(
    DEMO_MODE ? INITIAL_ACTIVITY_LOG : []
  );
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Ids awaiting a MANAGER-tier decision; null until the queue loads (demo mode).
  const [queueIds, setQueueIds] = useState<Set<string> | null>(null);

  // Compute live KPIs
  const pendingRequests = requests.filter((r) =>
    queueIds ? queueIds.has(r.id) : r.status === 'PENDING_APPROVAL' || r.status === 'SUBMITTED'
  );
  const approvedToday = requests.filter((r) => r.status === 'APPROVED');
  const rejectedRequests = requests.filter((r) => r.status === 'REJECTED');
  const totalPendingCount = pendingRequests.length;

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleReview = (req: PaymentRequestItem) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const fetchDashboardData = useCallback(async () => {
    if (DEMO_MODE) return;
    setLoading(true);
    const [queueRes, paymentsRes, auditRes] = await Promise.allSettled([
      approvalService.getQueue({ tier: 'MANAGER' }),
      paymentService.listRequests({ limit: '500' }),
      auditService.listEvents({ limit: '6' }),
    ]);

    if (queueRes.status === 'fulfilled') {
      setQueueIds(new Set((queueRes.value.results ?? []).map((q) => q.id)));
    }

    if (paymentsRes.status === 'fulfilled') {
      setRequests((paymentsRes.value.results ?? []).map(toRequestItem));
      setLoadError(null);
    } else {
      const err = paymentsRes.reason;
      setLoadError(err instanceof Error ? err.message : 'Unable to load payment requests.');
    }

    if (auditRes.status === 'fulfilled') {
      setActivities((auditRes.value.results ?? []).map(toActivityEvent));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApprove = async (requestId: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    try {
      await approvalService.approve(requestId);
      setQueueIds((prev) => (prev ? new Set([...prev].filter((id) => id !== requestId)) : prev));
      const isDual = getApprovalRoute(target.amount).isDual;
      const nowIso = new Date().toISOString();

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          // Above the threshold the request still awaits the finance tier.
          return {
            ...r,
            status: isDual ? r.status : 'APPROVED',
            updatedAt: nowIso,
          };
        })
      );

      const newActivity: ActivityEvent = {
        id: `act-${Date.now()}`,
        at: nowIso,
        actorName: currentUser?.name || 'You',
        action: 'Approved payment',
        entity: 'PaymentRequest',
        requestReference: target.id,
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed.';
      showToast(msg, true);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    try {
      await approvalService.reject(requestId, reason);
      setQueueIds((prev) => (prev ? new Set([...prev].filter((id) => id !== requestId)) : prev));
      const nowIso = new Date().toISOString();

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            status: 'REJECTED',
            updatedAt: nowIso,
          };
        })
      );

      const newActivity: ActivityEvent = {
        id: `act-${Date.now()}`,
        at: nowIso,
        actorName: currentUser?.name || 'You',
        action: 'Rejected payment',
        entity: 'PaymentRequest',
        requestReference: target.id,
        description: `Manager rejected ${target.reference}: "${reason}"`,
      };

      setActivities((prev) => [newActivity, ...prev]);
      showToast(`Payment request ${target.reference} has been rejected.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.';
      showToast(msg, true);
    }
  };

  const displayName = currentUser?.name || 'Manager';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-16 right-6 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            toast.isError
              ? 'border-err/30 bg-err-light text-err'
              : 'border-ok/30 bg-ok-light text-ok'
          }`}
        >
          {toast.isError ? (
            <AlertCircle className="size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-ink">
            Manager dashboard{currentUser?.department ? ` · ${currentUser.department}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-canvas transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/manager/requests"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="size-4" />
            <span>New Payment Request</span>
          </Link>
        </div>
      </div>

      {DEMO_MODE && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>Demo mode: showing sample data. Nothing is read from the backend.</span>
        </div>
      )}

      {loadError && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-err/30 bg-err-light p-3 text-xs text-err">
          <AlertCircle className="size-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* 4-Card Summary Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Pending Approval"
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
      <RecentActivity events={activities} requests={requests} />

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
