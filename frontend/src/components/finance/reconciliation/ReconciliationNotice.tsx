import React from 'react';
import { AlertCircle } from 'lucide-react';

export function ReconciliationNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 shadow-2xs">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
      <p>
        <span className="font-semibold">Reconciliation Rule:</span> Unconfirmed attempts must be verified directly with the provider before retry to prevent duplicate payouts.
      </p>
    </div>
  );
}
