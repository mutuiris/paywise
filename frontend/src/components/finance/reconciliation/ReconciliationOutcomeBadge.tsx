import React from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export function ReconciliationOutcomeBadge({ status }: { status: string }) {
  if (status === 'SUCCEEDED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
        <CheckCircle2 className="size-3" />
        <span>Succeeded</span>
      </span>
    );
  }
  if (status === 'AMBIGUOUS' || status === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        <AlertCircle className="size-3" />
        <span>In Process</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
      <XCircle className="size-3" />
      <span>Failed</span>
    </span>
  );
}
