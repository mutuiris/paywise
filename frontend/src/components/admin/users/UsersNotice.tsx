import React from 'react';
import { Info } from 'lucide-react';

export function UsersNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-50/50 p-3 text-xs text-ink dark:bg-amber-950/20 font-serif">
      <Info className="size-4 shrink-0 text-amber-600 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-900 dark:text-amber-200">
          Demo Environment · Backend Integration Pending
        </p>
        <p className="mt-0.5 text-muted-ink">
          User management API endpoints (<code className="font-mono text-[11px] bg-amber-100/60 dark:bg-amber-900/40 px-1 py-0.5 rounded">/api/accounts/</code>) are currently in development. User role updates and additions are simulated in memory and not yet persisted.
        </p>
      </div>
    </div>
  );
}
