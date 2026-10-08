'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Building2,
  FileText,
  CreditCard,
  User,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import {
  formatCurrency,
  getApprovalRoute,
} from '@/data/mock-manager-data';
import { StatusBadge } from './StatusBadge';

interface ApprovalModalProps {
  request: PaymentRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

export function ApprovalModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ApprovalModalProps) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !request) return null;

  const route = getApprovalRoute(request.amount);

  const handleApprove = () => {
    onApprove(request.id);
    onClose();
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      setErrorMsg('Please provide a reason for rejecting this payment request.');
      return;
    }
    onReject(request.id, rejectReason.trim());
    setRejecting(false);
    setRejectReason('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-serif">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-surface-subtle">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-brand">
              {request.reference}
            </span>
            <StatusBadge status={request.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md border border-line text-muted-ink hover:bg-canvas hover:text-ink cursor-pointer transition-colors"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Amount & Vendor Highlights */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-line bg-canvas p-4">
            <div>
              <p className="text-xs font-medium text-muted-ink uppercase tracking-wider">
                Total Payable Amount
              </p>
              <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-ink">
                {formatCurrency(request.amount)}
              </p>
            </div>
            <div className="sm:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-deep border border-brand/20">
                <CreditCard className="size-3.5" />
                {request.paymentMethod === 'MPESA' ? 'M-Pesa Payout' : 'Bank Wire Transfer'}
              </span>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div className="flex items-start gap-3 rounded-lg border border-line p-3">
              <Building2 className="size-4.5 text-muted-ink shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs text-muted-ink font-medium">Vendor / Payee</span>
                <span className="font-semibold text-ink">{request.vendorName}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-line p-3">
              <FileText className="size-4.5 text-muted-ink shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs text-muted-ink font-medium">Invoice Number</span>
                <span className="font-mono font-semibold text-ink">{request.invoiceNumber}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-line p-3">
              <User className="size-4.5 text-muted-ink shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs text-muted-ink font-medium">Requested By</span>
                <span className="font-semibold text-ink">{request.requesterName}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-line p-3">
              <Calendar className="size-4.5 text-muted-ink shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs text-muted-ink font-medium">Project Site</span>
                <span className="font-semibold text-ink">{request.project}</span>
              </div>
            </div>
          </div>

          {/* Description & Purpose */}
          <div className="rounded-lg border border-line p-4 bg-surface-subtle">
            <h4 className="text-xs font-semibold text-muted-ink uppercase tracking-wider">
              Payment Purpose & Description
            </h4>
            <p className="mt-1 text-sm font-medium text-ink">{request.reason}</p>
            {request.notes && (
              <p className="mt-2 text-xs text-muted-ink border-t border-line pt-2">
                <span className="font-semibold text-ink">Notes:</span> {request.notes}
              </p>
            )}
          </div>

          {/* Approval Routing Flow */}
          <div className="rounded-lg border border-line p-4">
            <h4 className="text-xs font-semibold text-muted-ink uppercase tracking-wider mb-3">
              Approval Routing Path
            </h4>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 rounded-md bg-warn/10 text-warn border border-warn/30 px-3 py-1.5 font-medium">
                <span className="size-2 rounded-full bg-warn" />
                <span>1. Manager Review (You)</span>
              </div>
              {route.isDual && (
                <>
                  <ArrowRight className="size-4 text-muted-ink" />
                  <div className="flex items-center gap-1.5 rounded-md bg-canvas text-muted-ink border border-line px-3 py-1.5 font-medium">
                    <span className="size-2 rounded-full bg-muted-ink" />
                    <span>2. Finance Approval</span>
                  </div>
                </>
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted-ink">
              {route.isDual
                ? 'Amount exceeds KES 50,000 threshold. Following your approval, this will route to Finance Officer.'
                : 'Amount is within your KES 50,000 limit. Following your approval, this will be ready for payment release.'}
            </p>
          </div>

          {/* Rejection Input Box (if user clicked reject) */}
          {rejecting && (
            <div className="rounded-xl border border-err/30 bg-err-light p-4 space-y-3">
              <div className="flex items-center gap-2 text-err text-xs font-semibold">
                <AlertTriangle className="size-4" />
                <span>Reason for Rejection (Required)</span>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                rows={3}
                placeholder="e.g. Rate exceeds agreed master framework price; duplicate invoice number..."
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
                  onClick={handleRejectSubmit}
                  className="rounded-md bg-err px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!rejecting && (
          <div className="flex items-center justify-end gap-3 border-t border-line bg-surface-subtle px-6 py-4">
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-err/30 bg-surface px-4 py-2 text-sm font-semibold text-err hover:bg-err/5 cursor-pointer transition-colors"
            >
              <XCircle className="size-4" />
              <span>Reject Request</span>
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer shadow-sm transition-colors"
            >
              <CheckCircle2 className="size-4" />
              <span>Approve Payment</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
