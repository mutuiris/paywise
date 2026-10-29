import React from 'react';
import { PaymentRequestItem } from '@/types/manager';
import { formatDateTime, getApprovalRoute } from '@/data/mock-manager-data';

interface ApprovalTimelineCardProps {
  request: PaymentRequestItem;
}

export function ApprovalTimelineCard({ request }: ApprovalTimelineCardProps) {
  const route = getApprovalRoute(request.amount);
  const managerApproval = request.approvals?.find((a) => a.type === 'MANAGER');
  const financeApproval = request.approvals?.find((a) => a.type === 'FINANCE');

  return (
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
  );
}
