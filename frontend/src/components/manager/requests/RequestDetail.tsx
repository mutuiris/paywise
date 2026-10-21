'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Building2,
  FileText,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import {
  INITIAL_PAYMENT_REQUESTS,
  CURRENT_MANAGER,
  formatCurrency,
  formatDate,
  formatDateTime,
  getApprovalRoute,
} from '@/data/mock-manager-data';
import { PaymentRequestItem } from '@/types/manager';
import { StatusBadge } from '../common/StatusBadge';
import { paymentService, approvalService } from '@/lib/api/services';
import { getClientUser } from '@/lib/auth/session';

export interface RequestDetailProps {
  requestId: string;
  basePath?: string;
}

export function RequestDetail({ requestId, basePath = '/manager' }: RequestDetailProps) {
  const fallback = INITIAL_PAYMENT_REQUESTS.find((r) => r.id === requestId) || INITIAL_PAYMENT_REQUESTS[0];
  const [request, setRequest] = useState<PaymentRequestItem>(fallback);
  const [usingFallback, setUsingFallback] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
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
  const route = getApprovalRoute(request.amount);
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

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setErrorMsg('Please specify a rejection reason.');
      return;
    }
    try {
      await approvalService.reject(request.id, rejectReason.trim());
      setRequest((prev) => ({
        ...prev,
        status: 'REJECTED',
        updatedAt: new Date().toISOString(),
        rejectionReason: rejectReason.trim(),
      }));
      setRejecting(false);
      setRejectReason('');
      setErrorMsg('');
      showToast(`Payment request ${request.reference} was rejected.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.';
      showToast(msg, true);
    }
  };

  const managerApproval = request.approvals?.find((a) => a.type === 'MANAGER');
  const financeApproval = request.approvals?.find((a) => a.type === 'FINANCE');

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
          {toast.isError ? (
            <AlertCircle className="size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>Showing cached demonstration requisition (Backend server unreachable). Approvals run in local demonstration mode.</span>
        </div>
      )}

      {/* Back Link */}
      <div>
        <Link
          href={`${basePath}/requests`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-ink hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Payment Requests</span>
        </Link>

        {/* Page Title & Status */}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-2xs hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer">
          <span className="text-sm font-semibold text-ink font-serif tracking-tight block">
            Payable Amount
          </span>
          <span className="font-serif text-lg sm:text-xl font-bold tabular-nums text-ink mt-1 block">
            {formatCurrency(request.amount)}
          </span>
          <span className="text-[11px] text-muted-ink font-serif mt-0.5 block">
            {request.currency} Currency
          </span>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 shadow-2xs hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer">
          <span className="text-sm font-semibold text-ink font-serif tracking-tight block">
            Vendor / Payee
          </span>
          <span className="text-base font-semibold text-ink mt-1 truncate block">
            {request.vendorName}
          </span>
          <span className="text-[11px] font-serif text-muted-ink mt-0.5 block">
            INV: {request.invoiceNumber}
          </span>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 shadow-2xs hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer">
          <span className="text-sm font-semibold text-ink font-serif tracking-tight block">
            Disbursement Channel
          </span>
          <span className="text-base font-semibold text-ink mt-1 flex items-center gap-1.5">
            <CreditCard className="size-4 text-brand" />
            <span>{request.paymentMethod === 'MPESA' ? 'M-Pesa Payout' : 'Bank'}</span>
          </span>
          <span className="text-[11px] text-muted-ink font-serif mt-0.5 block">
            Direct settlement
          </span>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 shadow-2xs hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer">
          <span className="text-sm font-semibold text-ink font-serif tracking-tight block">
            Approval Routing
          </span>
          <span className="text-xs font-semibold text-brand mt-1 block">
            {route.label}
          </span>
          <span className="text-[11px] text-muted-ink font-serif mt-0.5 block">
            {route.isDual ? 'Threshold > 50,000' : 'Threshold ≤ 50,000'}
          </span>
        </div>
      </div>

      {/* Main Grid: Details + Workflow */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols): Requisition Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-line pb-2 flex items-center gap-2">
              <FileText className="size-4 text-brand" />
              <span>Requisition Details</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-lg bg-surface-subtle border border-line p-3">
                <span className="text-xs text-muted-ink block">Project Site</span>
                <span className="font-semibold text-ink mt-0.5 block">{request.project}</span>
              </div>

              <div className="rounded-lg bg-surface-subtle border border-line p-3">
                <span className="text-xs text-muted-ink block">Requested By</span>
                <span className="font-semibold text-ink mt-0.5 block">{request.requesterName}</span>
              </div>

              <div className="rounded-lg bg-surface-subtle border border-line p-3">
                <span className="text-xs text-muted-ink block">Invoice Reference</span>
                <span className="font-serif font-semibold text-ink mt-0.5 block">{request.invoiceNumber}</span>
              </div>

              <div className="rounded-lg bg-surface-subtle border border-line p-3">
                <span className="text-xs text-muted-ink block">Requested Payout Date</span>
                <span className="font-semibold text-ink mt-0.5 block">{formatDate(request.requestedPaymentDate)}</span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <span className="text-xs font-semibold text-muted-ink uppercase tracking-wider block">
                Payment Purpose / Description
              </span>
              <p className="mt-1 text-sm font-medium text-ink bg-canvas border border-line rounded-lg p-3">
                {request.reason}
              </p>
            </div>

            {/* Notes */}
            {request.notes && (
              <div>
                <span className="text-xs font-semibold text-muted-ink uppercase tracking-wider block">
                  Supporting Verification Remarks
                </span>
                <p className="mt-1 text-xs text-muted-ink bg-canvas border border-line rounded-lg p-3">
                  {request.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Box for Manager (if decision pending) */}
          {basePath === '/manager' && (request.status === 'PENDING_APPROVAL' || request.status === 'SUBMITTED') && (
            <div className="rounded-2xl border border-brand/30 bg-brand-light/30 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-brand" />
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                  Manager Action Required
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-ink">
                As the designated department manager, please review the attached invoice details and issue your approval decision.
              </p>

              {rejecting ? (
                <div className="rounded-xl border border-err/30 bg-err-light p-4 space-y-3">
                  <div className="flex items-center gap-2 text-err text-xs font-semibold">
                    <AlertTriangle className="size-4" />
                    <span>Provide Reason for Rejection</span>
                  </div>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    rows={3}
                    placeholder="Describe why this payment request cannot be approved…"
                    className="w-full rounded-md border border-line bg-surface p-3 text-sm text-ink placeholder:text-muted-ink focus:border-err focus:outline-none focus:ring-2 focus:ring-err/20"
                  />
                  {errorMsg && (
                    <p className="text-xs font-medium text-err">{errorMsg}</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejecting(false)}
                      className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="rounded-md bg-err px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer transition-colors"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSelfRequest}
                    onClick={handleApprove}
                    title={isSelfRequest ? 'Cannot self-approve your own requisition' : undefined}
                    className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Approve Payment Request</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejecting(true)}
                    className="inline-flex items-center gap-2 rounded-md border border-err/30 bg-surface px-4 py-2 text-sm font-semibold text-err hover:bg-err/5 cursor-pointer transition-colors"
                  >
                    <XCircle className="size-4" />
                    <span>Reject with Reason</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (1 col): Workflow & Audit Trail */}
        <div className="space-y-6">
          {/* Approval Workflow Stepper */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-line pb-2">
              Approval Workflow Timeline
            </h3>

            <div className="relative pl-6 space-y-6 border-l-2 border-line">
              {/* Step 1: Submission */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0 grid size-5 place-items-center rounded-full bg-brand text-white text-[10px]">
                  ✓
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink">Requisition Submitted</p>
                  <p className="text-[11px] text-muted-ink">
                    By {request.requesterName}
                  </p>
                  <time className="text-[10px] text-muted-ink font-serif block mt-0.5">
                    {formatDateTime(request.createdAt)}
                  </time>
                </div>
              </div>

              {/* Step 2: Manager Review */}
              <div className="relative">
                <span
                  className={`absolute -left-[31px] top-0 grid size-5 place-items-center rounded-full text-[10px] ${
                    managerApproval?.decision === 'APPROVED'
                      ? 'bg-ok text-white'
                      : managerApproval?.decision === 'REJECTED'
                      ? 'bg-err text-white'
                      : 'bg-warn text-white animate-pulse'
                  }`}
                >
                  {managerApproval?.decision === 'APPROVED' ? '✓' : managerApproval?.decision === 'REJECTED' ? '✕' : '1'}
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink">Manager Review</p>
                  <p className="text-[11px] text-muted-ink">
                    {managerApproval?.decision === 'APPROVED'
                      ? `Approved by ${managerApproval.approverName || 'Carol Wanjiku'}`
                      : managerApproval?.decision === 'REJECTED'
                      ? `Rejected: "${managerApproval.reason}"`
                      : 'Awaiting your review'}
                  </p>
                  {managerApproval?.decidedAt && (
                    <time className="text-[10px] text-muted-ink font-serif block mt-0.5">
                      {formatDateTime(managerApproval.decidedAt)}
                    </time>
                  )}
                </div>
              </div>

              {/* Step 3: Finance Review (if dual step) */}
              {route.isDual && (
                <div className="relative">
                  <span
                    className={`absolute -left-[31px] top-0 grid size-5 place-items-center rounded-full text-[10px] ${
                      financeApproval?.decision === 'APPROVED'
                        ? 'bg-ok text-white'
                        : request.status === 'APPROVED' && managerApproval?.decision === 'APPROVED'
                        ? 'bg-warn text-white animate-pulse'
                        : 'bg-slate-200 text-muted-ink'
                    }`}
                  >
                    2
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink">Finance Authorization</p>
                    <p className="text-[11px] text-muted-ink">
                      {financeApproval?.decision === 'APPROVED'
                        ? 'Authorized by Finance Officer'
                        : managerApproval?.decision === 'APPROVED'
                        ? 'In review with Finance'
                        : 'Queued after manager sign-off'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Quick Info */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs text-xs space-y-2.5">
            <h4 className="font-bold text-ink uppercase tracking-wider border-b border-line pb-1.5 flex items-center gap-1.5">
              <Building2 className="size-3.5 text-brand" />
              <span>Vendor Profile</span>
            </h4>
            <p className="font-semibold text-ink text-sm">{request.vendorName}</p>
            <p className="text-muted-ink">
              Channel:{' '}
              <strong className="text-ink">
                {request.paymentMethod === 'MPESA' ? 'M-Pesa Payout' : 'Bank'}
              </strong>
            </p>
            <Link
              href={`${basePath}/vendors`}
              className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1 mt-1"
            >
              <span>View full vendor profile</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
