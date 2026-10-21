'use client';

import React from 'react';
import Link from 'next/link';
import { Check, X, ShieldAlert } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import { CURRENT_MANAGER, formatCurrency, formatDate } from '@/data/mock-manager-data';
import { getClientUser } from '@/lib/auth/session';

interface ManagerApprovalsRowProps {
  req: PaymentRequestItem;
  onApprove: (req: PaymentRequestItem) => void;
  onReject: (req: PaymentRequestItem) => void;
}

export function ManagerApprovalsRow({ req, onApprove, onReject }: ManagerApprovalsRowProps) {
  const currentUser = getClientUser();
  const isDual = req.amount > CURRENT_MANAGER.approvalLimit;
  const isSelf = Boolean(
    (currentUser && req.requesterId === currentUser.id) ||
    (req.requesterName && currentUser?.name && req.requesterName.toLowerCase() === currentUser.name.toLowerCase()) ||
    req.requesterId === CURRENT_MANAGER.id ||
    (req.requesterName && req.requesterName.toLowerCase() === CURRENT_MANAGER.name.toLowerCase())
  );

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
      <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">{formatCurrency(req.amount)}</td>
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
          <button type="button" onClick={() => onReject(req)} className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-err hover:bg-err/5 cursor-pointer transition shadow-2xs"><X className="size-3" /><span>Reject</span></button>
          <button
            type="button"
            disabled={isSelf}
            onClick={() => onApprove(req)}
            title={isSelf ? 'Cannot self-approve your own requisition' : undefined}
            className={`inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition shadow-2xs ${isSelf ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
          >
            <Check className="size-3" />
            <span>Approve</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
