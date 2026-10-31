'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import { ManagerApprovalsRow } from './ManagerApprovalsRow';

interface ManagerApprovalsTableProps {
  requests: PaymentRequestItem[];
  onApprove: (req: PaymentRequestItem) => void;
  onReject: (req: PaymentRequestItem) => void;
  /** Id of the signed-in user, used to block self-approval. */
  currentUserId?: string | null;
  /** Id of the request whose decision is currently in flight. */
  decidingId?: string | null;
}

export function ManagerApprovalsTable({
  requests,
  onApprove,
  onReject,
  currentUserId,
  decidingId,
}: ManagerApprovalsTableProps) {
  return (
    <div className="rounded-xl border border-line bg-surface shadow-2xs overflow-hidden">
      <div className="border-b border-line px-5 py-4 bg-surface-subtle flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Pending Requisitions ({requests.length})</h2>
          <p className="text-xs text-muted-ink mt-0.5">Action items requiring review under your department.</p>
        </div>
        <Link href="/manager/requests" className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
          <span>All Requests</span><ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink border-b border-line">
            <tr>
              <th className="px-5 py-3">Reference</th><th className="px-5 py-3">Vendor</th><th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3">Requester</th><th className="px-5 py-3">Project</th><th className="px-5 py-3">Submitted</th>
              <th className="px-5 py-3">Routing</th><th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            {requests.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-xs text-muted-ink">No requests currently awaiting your approval.</td></tr>
            ) : (
              requests.map((req) => (
                <ManagerApprovalsRow
                  key={req.id}
                  req={req}
                  onApprove={onApprove}
                  onReject={onReject}
                  currentUserId={currentUserId}
                  isDeciding={decidingId === req.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
