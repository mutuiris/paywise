'use client';

import React from 'react';

export interface ManagerApprovalsHeaderProps {
  /** The signed-in approver, resolved from the backend session. */
  approverName: string;
  /** Role of the signed-in approver, for example "Manager". */
  approverRole: string;
  /** The approval tier this queue is filtered by, when one applies. */
  tier?: string;
}

export function ManagerApprovalsHeader({
  approverName,
  approverRole,
  tier,
}: ManagerApprovalsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-serif">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Approvals Queue
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Review and clear payment requisitions awaiting {tier ? tier.toLowerCase() : 'approver'}{' '}
          authorization.
        </p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-muted-ink">
        <span>Approver:</span>
        <span className="font-semibold text-ink">{approverName}</span>
        <span>({approverRole})</span>
        <span className="hidden sm:inline">
          · {tier === 'FINANCE'
            ? 'Finance clearance for requests above KES 50,000'
            : 'Manager approval up to KES 50,000'}
        </span>
      </div>
    </div>
  );
}
