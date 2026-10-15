'use client';

import React from 'react';
import { CURRENT_MANAGER } from '@/data/mock-manager-data';

export function ManagerApprovalsHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Approvals Queue
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Review and clear payment requisitions awaiting manager authorization.
        </p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-muted-ink">
        <span>Manager:</span>
        <span className="font-semibold text-ink">{CURRENT_MANAGER.name}</span>
        <span>(Limit: KES 50k)</span>
      </div>
    </div>
  );
}
