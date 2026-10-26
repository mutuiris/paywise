'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  INITIAL_PAYMENT_REQUESTS,
  CURRENT_MANAGER,
  formatDate,
} from '@/data/mock-manager-data';
import { PaymentRequestItem } from '@/types/manager';
import { StatusBadge } from '../common/StatusBadge';
import { paymentService, approvalService } from '@/lib/api/services';
import { getClientUser } from '@/lib/auth/session';
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
  const fallback = INITIAL_PAYMENT_REQUESTS.find((r) => r.id === requestId) || INITIAL_PAYMENT_REQUESTS[0];
  const [request, setRequest] = useState<PaymentRequestItem>(fallback);
  const [usingFallback, setUsingFallback] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  useEffect(() => {
    let ignore = false;
    paymentService
      .getRequest(requestId)
      .then((dto) => {
        if (ignore) return;
        if (dto) {
          const mapped: PaymentRequestItem = {
            id: dto.id,
            reference: dto.invoice_number || `PR-${dto.id.slice(0, 6).toUpperCase()}`,
            vendorId: dto.vendor_id,
            vendorName: dto.vendor_name || 'Designated Vendor',
            amount: parseFloat(dto.amount) || 0,
            currency: dto.currency || 'KES',
            invoiceNumber: dto.invoice_number || `INV-${dto.id.slice(0, 6).toUpperCase()}`,
            project: dto.project_name || 'ImaraWorks Construction',
            requesterId: dto.requester_id || '',
            requesterName: dto.requester_username || 'Employee',
            paymentMethod: dto.payment_method === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
            requestedPaymentDate: dto.created_at || new Date().toISOString(),
            notes: dto.supporting_notes || dto.description || '',
            reason: dto.description || '',
            status: dto.status,
            rejectionReason: dto.rejection_reason || undefined,
            createdAt: dto.created_at || new Date().toISOString(),
            updatedAt: dto.updated_at || new Date().toISOString(),
          };
          setRequest(mapped);
          setUsingFallback(false);
        }
      })
      .catch(() => {
        if (ignore) return;
        setUsingFallback(true);
      });

    return () => {
      ignore = true;
    };
  }, [requestId]);

  const currentUser = getClientUser();
  const isSelfRequest = Boolean(
    request && (
      (currentUser && request.requesterId === currentUser.id) ||
      (request.requesterName && currentUser?.name && request.requesterName.toLowerCase() === currentUser.name.toLowerCase()) ||
      request.requesterId === CURRENT_MANAGER.id ||
      (request.requesterName && request.requesterName.toLowerCase() === CURRENT_MANAGER.name.toLowerCase())
    )
  );

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = async () => {
    if (isSelfRequest) return;
    try {
      await approvalService.approve(request.id);
      setRequest((prev) => ({
        ...prev,
        status: 'APPROVED',
        updatedAt: new Date().toISOString(),
      }));
      showToast(`✓ Payment request ${request.reference} has been approved.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed.';
      showToast(msg, true);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await approvalService.reject(request.id, reason);
      setRequest((prev) => ({
        ...prev,
        status: 'REJECTED',
        updatedAt: new Date().toISOString(),
        rejectionReason: reason,
      }));
      showToast(`Payment request ${request.reference} was rejected.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.';
      showToast(msg, true);
    }
  };

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

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3 text-xs text-muted-ink">
          <AlertCircle className="size-4 shrink-0 text-muted-ink" />
          <span>Backend payments endpoint offline. Displaying local data.</span>
        </div>
      )}

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
