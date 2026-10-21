'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
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
import { approvalService, paymentService, auditService } from '@/lib/api/services';
import { getClientUser } from '@/lib/auth/session';

export function ManagerDashboard() {
  const [currentUser] = useState(() => getClientUser());
  const [requests, setRequests] = useState<PaymentRequestItem[]>(INITIAL_PAYMENT_REQUESTS);
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_LOG);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // Compute live KPIs
  const pendingRequests = requests.filter(
    (r) => r.status === 'PENDING_APPROVAL' || r.status === 'SUBMITTED'
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

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const [queueRes, paymentsRes, auditRes] = await Promise.allSettled([
        approvalService.getQueue({ tier: 'MANAGER' }),
        paymentService.listRequests({ limit: '20' }),
        auditService.listEvents({ limit: '6' }),
      ]);

      if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.results?.length) {
        const mapped: PaymentRequestItem[] = paymentsRes.value.results.map((r) => ({
          id: r.id,
          reference: r.invoice_number || `PR-${r.id.slice(0, 6).toUpperCase()}`,
          vendorId: r.vendor_id,
          vendorName: r.vendor_name || 'Designated Vendor',
          amount: parseFloat(r.amount) || 0,
          currency: 'KES',
          invoiceNumber: r.invoice_number || `INV-${r.id.slice(0, 6).toUpperCase()}`,
          project: r.project_name || 'ImaraWorks Construction',
          requesterId: r.requester_id || '',
          requesterName: r.requester_username || 'Employee',
          paymentMethod: r.payment_method === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
          requestedPaymentDate: r.created_at || new Date().toISOString(),
          notes: r.description || '',
          reason: r.description,
          status: r.status,
          rejectionReason: r.rejection_reason || undefined,
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || new Date().toISOString(),
        }));
        setRequests(mapped);
      } else if (queueRes.status === 'fulfilled' && queueRes.value?.results?.length) {
        const mappedQueue: PaymentRequestItem[] = queueRes.value.results.map((q) => ({
          id: q.id,
          reference: q.invoice_number || `PR-${q.id.slice(0, 6).toUpperCase()}`,
          vendorId: q.vendor_id,
          vendorName: q.vendor_name || 'Designated Vendor',
          amount: parseFloat(q.amount) || 0,
          currency: 'KES',
          invoiceNumber: q.invoice_number || `INV-${q.id.slice(0, 6).toUpperCase()}`,
          project: 'ImaraWorks Construction',
          requesterId: q.requester_id || '',
          requesterName: q.requester_name || 'Employee',
          paymentMethod: 'MPESA',
          requestedPaymentDate: q.created_at || new Date().toISOString(),
          notes: q.description || '',
          reason: q.description,
          status: q.status,
          createdAt: q.created_at || new Date().toISOString(),
          updatedAt: q.created_at || new Date().toISOString(),
        }));
        setRequests(mappedQueue);
      }

      if (auditRes.status === 'fulfilled' && auditRes.value?.results?.length) {
        const mappedActs: ActivityEvent[] = auditRes.value.results.map((e) => ({
          id: e.id,
          at: e.created_at || new Date().toISOString(),
          actorName: e.actor_email ? e.actor_email.split('@')[0] : 'System User',
          action: e.action,
          entity: e.entity_type,
          requestReference: e.entity_id ? e.entity_id.slice(0, 8).toUpperCase() : 'PR',
          description: e.description,
        }));
        setActivities(mappedActs);
      }

      setUsingFallback(false);
    } catch {
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      approvalService.getQueue({ tier: 'MANAGER' }),
      paymentService.listRequests({ limit: '20' }),
      auditService.listEvents({ limit: '6' }),
    ]).then(([queueRes, paymentsRes, auditRes]) => {
      if (ignore) return;

      if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.results?.length) {
        const mapped: PaymentRequestItem[] = paymentsRes.value.results.map((r) => ({
          id: r.id,
          reference: r.invoice_number || `PR-${r.id.slice(0, 6).toUpperCase()}`,
          vendorId: r.vendor_id,
          vendorName: r.vendor_name || 'Designated Vendor',
          amount: parseFloat(r.amount) || 0,
          currency: 'KES',
          invoiceNumber: r.invoice_number || `INV-${r.id.slice(0, 6).toUpperCase()}`,
          project: r.project_name || 'ImaraWorks Construction',
          requesterId: r.requester_id || '',
          requesterName: r.requester_username || 'Employee',
          paymentMethod: r.payment_method === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
          requestedPaymentDate: r.created_at || new Date().toISOString(),
          notes: r.description || '',
          reason: r.description,
          status: r.status,
          rejectionReason: r.rejection_reason || undefined,
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || new Date().toISOString(),
        }));
        setRequests(mapped);
      } else if (queueRes.status === 'fulfilled' && queueRes.value?.results?.length) {
        const mappedQueue: PaymentRequestItem[] = queueRes.value.results.map((q) => ({
          id: q.id,
          reference: q.invoice_number || `PR-${q.id.slice(0, 6).toUpperCase()}`,
          vendorId: q.vendor_id,
          vendorName: q.vendor_name || 'Designated Vendor',
          amount: parseFloat(q.amount) || 0,
          currency: 'KES',
          invoiceNumber: q.invoice_number || `INV-${q.id.slice(0, 6).toUpperCase()}`,
          project: 'ImaraWorks Construction',
          requesterId: q.requester_id || '',
          requesterName: q.requester_name || 'Employee',
          paymentMethod: 'MPESA',
          requestedPaymentDate: q.created_at || new Date().toISOString(),
          notes: q.description || '',
          reason: q.description,
          status: q.status,
          createdAt: q.created_at || new Date().toISOString(),
          updatedAt: q.created_at || new Date().toISOString(),
        }));
        setRequests(mappedQueue);
      }

      if (auditRes.status === 'fulfilled' && auditRes.value?.results?.length) {
        const mappedActs: ActivityEvent[] = auditRes.value.results.map((e) => ({
          id: e.id,
          at: e.created_at || new Date().toISOString(),
          actorName: e.actor_email ? e.actor_email.split('@')[0] : 'System User',
          action: e.action,
          entity: e.entity_type,
          requestReference: e.entity_id ? e.entity_id.slice(0, 8).toUpperCase() : 'PR',
          description: e.description,
        }));
        setActivities(mappedActs);
      }

      setUsingFallback(false);
      setLoading(false);
    }).catch(() => {
      if (ignore) return;
      setUsingFallback(true);
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const handleApprove = async (requestId: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    try {
      await approvalService.approve(requestId);
      const isDual = target.amount > CURRENT_MANAGER.approvalLimit;
      const nowIso = new Date().toISOString();

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            status: 'APPROVED',
            updatedAt: nowIso,
          };
        })
      );

      const newActivity: ActivityEvent = {
        id: `act-${Date.now()}`,
        at: nowIso,
        actorName: currentUser?.name || CURRENT_MANAGER.name,
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
        actorName: currentUser?.name || CURRENT_MANAGER.name,
        action: 'Rejected payment',
        entity: 'PaymentRequest',
        requestReference: target.reference,
        description: `Manager rejected ${target.reference}: "${reason}"`,
      };

      setActivities((prev) => [newActivity, ...prev]);
      showToast(`Payment request ${target.reference} has been rejected.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.';
      showToast(msg, true);
    }
  };

  const displayName = currentUser?.name || CURRENT_MANAGER.name;
  const firstName = displayName.split(' ')[0];

  return (
    <div className="space-y-6 font-serif">
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
            Manager dashboard · {CURRENT_MANAGER.department}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
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

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>Showing cached demonstration queue (Backend server unreachable). Approvals run in local demonstration mode.</span>
        </div>
      )}

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
