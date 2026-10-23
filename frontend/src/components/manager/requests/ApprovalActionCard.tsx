'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';

interface ApprovalActionCardProps {
  request: PaymentRequestItem;
  isSelfRequest: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function ApprovalActionCard({
  isSelfRequest,
  onApprove,
  onReject,
}: ApprovalActionCardProps) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setErrorMsg('Please specify a rejection reason.');
      return;
    }
    onReject(rejectReason.trim());
    setRejecting(false);
    setRejectReason('');
    setErrorMsg('');
  };

  return (
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
              onClick={() => {
                setRejecting(false);
                setErrorMsg('');
              }}
              className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
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
            onClick={onApprove}
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
  );
}
