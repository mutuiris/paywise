'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import {
  INITIAL_PAYMENT_REQUESTS,
  CURRENT_MANAGER,
  formatDate,
} from '@/data/mock-manager-data';
import { PaymentRequestItem } from '@/types/manager';
import { StatusBadge } from '../common/StatusBadge';
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
  const [requests, setRequests] = useState<PaymentRequestItem[]>(INITIAL_PAYMENT_REQUESTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const request = requests.find((r) => r.id === requestId) || requests[0];
  const isSelfRequest = Boolean(
    request && (
      request.requesterId === CURRENT_MANAGER.id ||
      (request.requesterName && request.requesterName.toLowerCase() === CURRENT_MANAGER.name.toLowerCase())
    )
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = () => {
    if (isSelfRequest) return;
    const nowIso = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== request.id) return r;
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
    showToast(`✓ Payment request ${request.reference} has been approved.`);
  };

  const handleReject = (reason: string) => {
    const nowIso = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== request.id) return r;
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
    showToast(`Payment request ${request.reference} was rejected.`);
  };

  return (
    <div className="space-y-6 font-serif max-w-5xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-ok/30 bg-ok-light px-4 py-3 text-sm font-medium text-ok shadow-lg transition-all animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMessage}</span>
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

      {/* Top Highlight Cards */}
      <RequestHighlightCards request={request} />

      {/* Main Grid: Details + Workflow */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols): Requisition Details + Manager Action */}
        <div className="lg:col-span-2 space-y-6">
          <RequisitionDetailsCard request={request} />

          {basePath === '/manager' && (request.status === 'PENDING_APPROVAL' || request.status === 'SUBMITTED') && (
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
