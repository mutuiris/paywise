'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function FinanceApprovalsHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-serif">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Dual Approvals Queue
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Secondary clearance for disbursements exceeding the KES 50,000 threshold.
        </p>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-muted-ink">
        <ShieldCheck className="size-4 text-emerald-600" />
        <span>Dual Authority Enforced</span>
      </div>
    </div>
  );
}
