'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { INITIAL_PAYMENT_REQUESTS, formatDate } from '@/data/mock-manager-data';
import { ApprovalStepType, PaymentRequestItem } from '@/types/manager';
import { StatusBadge } from '../common/StatusBadge';
import { paymentService, approvalService } from '@/lib/api/services';
import { getClientUser } from '@/lib/auth/session';
import { DEMO_MODE } from '@/lib/config';
import type { PaymentRequestDTO } from '@/lib/api/types';
import { toRequestItem } from '../common/mapPaymentRequest';
import { RequestHighlightCards } from './RequestHighlightCards';
import { RequisitionDetailsCard } from './RequisitionDetailsCard';
import { ApprovalActionCard } from './ApprovalActionCard';
import { ApprovalTimelineCard } from './ApprovalTimelineCard';
import { VendorSummaryCard } from './VendorSummaryCard';

export interface RequestDetailProps {
  requestId: string;
  basePath?: string;
}

export function RequestDetail({ requestId, basePath = '/manager' }: RequestDetailProps) {
  const [request, setRequest] = useState<PaymentRequestItem | null>(
    DEMO_MODE ? INITIAL_PAYMENT_REQUESTS.find((r) => r.id === requestId) ?? null : null
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const loadRequest = useCallback(async () => {
    if (DEMO_MODE) return;
    const [requestRes, detailRes] = await Promise.allSettled([
      paymentService.getRequest(requestId),
      approvalService.getDetail(requestId),
    ]);
    if (requestRes.status === 'rejected') {
      const err = requestRes.reason;
      setLoadError(err instanceof Error ? err.message : 'Unable to load this payment request.');
      return;
    }
    const item = toRequestItem(requestRes.value.payment_request as PaymentRequestDTO);
    // Approval history and tiers come from the approvals endpoint when it is readable.
    if (detailRes.status === 'fulfilled') {
      const detail = detailRes.value;
      item.requiredTiers = detail.required_tiers as ApprovalStepType[];
      item.pendingTiers = detail.pending_tiers as ApprovalStepType[];
      item.approvals = (detail.history ?? []).map((a) => ({
        id: a.id,
        type: a.tier,
        decision: a.decision,
        approverId: a.approver_id,
        approverName: a.approver_name,
        decidedAt: a.created_at || undefined,
        reason: a.reason || undefined,
      }));
    }
    setRequest(item);
    setLoadError(null);
  }, [requestId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    loadRequest();
  }, [loadRequest]);

  const currentUser = getClientUser();
  // The backend also rejects self-approval; this only hides the buttons early.
  const isSelfRequest = Boolean(
    request && currentUser?.id && request.requesterId === currentUser.id
  );

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = async () => {
    if (!request || isSelfRequest) return;
    try {
      await approvalService.approve(request.id);
      await loadRequest();
      showToast(`✓ Payment request ${request.reference} has been approved.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed.';
      showToast(msg, true);
    }
  };

  const handleReject = async (reason: string) => {
    if (!request) return;
    try {
      await approvalService.reject(request.id, reason);
      await loadRequest();
      showToast(`Payment request ${request.reference} was rejected.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.';
      showToast(msg, true);
    }
  };

  if (!request) {
    return (
      <div className="space-y-4 font-serif max-w-5xl mx-auto pb-12">
        <Link
          href={`${basePath}/requests`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-ink hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Payment Requests</span>
        </Link>
        {loadError ? (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-err/30 bg-err-light p-3 text-xs text-err">
            <AlertCircle className="size-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        ) : (
          <p className="text-sm text-muted-ink">Loading payment request…</p>
        )}
      </div>
    );
  }

  // Only offer the manager decision while the manager tier is still pending.
  const managerDecisionPending =
    (request.status === 'PENDING_APPROVAL' || request.status === 'SUBMITTED') &&
    (request.pendingTiers ? request.pendingTiers.includes('MANAGER') : true);

  return (
    <div className="space-y-6 font-serif max-w-5xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-16 right-6 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in ${
            toast.isError
              ? 'border-err/30 bg-err-light text-err'
              : 'border-ok/30 bg-ok-light text-ok'
          }`}
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Back Link & Header */}
      <div>
        <Link
          href={`${basePath}/requests`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-ink hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Payment Requests</span>
        </Link>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {request.reference}
            </h1>
            <StatusBadge status={request.status} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-ink">
              Created {formatDate(request.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {DEMO_MODE && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3 text-xs text-muted-ink">
          <AlertCircle className="size-4 shrink-0 text-muted-ink" />
          <span>Demo mode: showing a sample request. Nothing is read from the backend.</span>
        </div>
      )}

      {/* Top Highlight Cards */}
      <RequestHighlightCards request={request} />

      {/* Main Grid: Details + Workflow */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols): Requisition Details + Manager Action */}
        <div className="lg:col-span-2 space-y-6">
          <RequisitionDetailsCard request={request} />

          {basePath === '/manager' && managerDecisionPending && (
            <ApprovalActionCard
              request={request}
              isSelfRequest={isSelfRequest}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </div>

        {/* Right Column (1 col): Timeline & Vendor Profile */}
        <div className="space-y-6">
          <ApprovalTimelineCard request={request} />
          <VendorSummaryCard request={request} basePath={basePath} />
        </div>
      </div>
    </div>
  );
}
