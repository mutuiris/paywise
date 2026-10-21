'use client';

import React from 'react';
import Link from 'next/link';
import { Check, X, ShieldAlert } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import { formatDate } from '@/data/mock-manager-data';

interface ManagerApprovalsRowProps {
  req: PaymentRequestItem;
  onApprove: (req: PaymentRequestItem) => void;
  onReject: (req: PaymentRequestItem) => void;
  /** Id of the signed-in user, used to block self-approval. */
  currentUserId?: string | null;
  isDeciding?: boolean;
}

export function ManagerApprovalsRow({
  req,
  onApprove,
  onReject,
  currentUserId,
  isDeciding,
}: ManagerApprovalsRowProps) {
  // The backend decides the routing: a request that requires more than one
  // tier has to be cleared by Finance as well.
  const isDual = (req.requiredTiers?.length ?? 1) > 1;
  // The backend refuses self-approval, so the button is disabled for the
  // requester's own requests.
  const isSelf = Boolean(currentUserId && req.requesterId && currentUserId === req.requesterId);

  return (
    <tr className="transition hover:bg-canvas/50 font-serif">
      <td className="whitespace-nowrap px-5 py-3.5">
        <Link href={`/manager/requests/${req.id}`} className="font-serif text-[13px] font-semibold text-brand hover:underline block">{req.reference}</Link>
        <span className="text-[11px] text-muted-ink block">{req.invoiceNumber}</span>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <span className="font-semibold text-ink block">{req.vendorName}</span>
        <span className="text-[11px] text-muted-ink truncate max-w-[180px] block">{req.reason}</span>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">
        KES {req.amount.toLocaleString()}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink font-medium">
        {req.requesterName}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">{req.project}</td>
      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">{formatDate(req.createdAt)}</td>
      <td className="whitespace-nowrap px-5 py-3.5">
        {isDual ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[11px] font-semibold text-warn">
            <ShieldAlert className="size-3" /><span>Dual (&gt;50k)</span>
          </span>
        ) : (
          <span className="inline-flex rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted-ink">Single Sign-off</span>
        )}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-right">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            disabled={isDeciding}
            onClick={() => onReject(req)}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-err hover:bg-err/5 cursor-pointer transition shadow-2xs disabled:opacity-50"
          >
            <X className="size-3" /><span>Reject</span>
          </button>
          <button
            type="button"
            disabled={isSelf || isDeciding}
            onClick={() => onApprove(req)}
            title={isSelf ? 'Cannot self-approve your own requisition' : undefined}
            className={`inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition shadow-2xs ${isSelf ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''} disabled:opacity-50`}
          >
            <Check className="size-3" />
            <span>{isDeciding ? 'Working…' : 'Approve'}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
