'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { PendingFinanceApproval } from './types';
import { formatCurrency, formatDate } from '@/data/mock-manager-data';

interface FinanceApprovalItemProps {
  item: PendingFinanceApproval;
  isSelfRequest?: boolean;
  onApprove: (item: PendingFinanceApproval) => void;
  onReject: (item: PendingFinanceApproval) => void;
}

export function FinanceApprovalItem({
  item,
  isSelfRequest = false,
  onApprove,
  onReject,
}: FinanceApprovalItemProps) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition hover:bg-canvas/40 font-serif">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-serif text-[13px] font-semibold text-brand-deep">{item.reference}</span>
          <span className="rounded-xs bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-muted-ink">{item.project}</span>
          <span className="font-serif text-xs text-muted-ink">Invoice: {item.invoiceNumber}</span>
          {isSelfRequest && (
            <span className="rounded-sm bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-300">
              Self-Approval Prohibited
            </span>
          )}
        </div>
        <p className="text-base font-bold text-ink">{item.vendorName}</p>
        <p className="text-xs text-muted-ink">{item.reason}</p>
        <p className="text-[11px] text-muted-ink">
          Requested by <span className="font-medium text-ink">{item.requesterName}</span> · First clearance by{' '}
          <span className="font-medium text-ink">{item.managerApprovedBy}</span> on {formatDate(item.managerApprovedAt)}
        </p>
      </div>

      <div className="flex flex-col items-start gap-3 sm:items-end">
        <span className="font-serif text-xl font-bold tabular-nums text-ink">{formatCurrency(item.amount)}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onReject(item)} className="inline-flex items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-err hover:bg-err/5 cursor-pointer transition shadow-2xs">
            <X className="size-3.5" /><span>Reject</span>
          </button>
          <button
            type="button"
            disabled={isSelfRequest}
            onClick={() => onApprove(item)}
            title={isSelfRequest ? "You cannot approve a payment request that you created." : "Approve this payment requisition"}
            className={`inline-flex items-center gap-1 rounded-md px-3.5 py-1.5 text-xs font-semibold transition shadow-2xs ${
              isSelfRequest
                ? 'bg-canvas text-muted-ink cursor-not-allowed border border-line'
                : 'bg-brand text-brand-foreground hover:bg-brand-deep cursor-pointer'
            }`}
          >
            <Check className="size-3.5" /><span>Approve Payout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
