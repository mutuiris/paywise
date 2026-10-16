import React from 'react';

export function ReconciliationHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Payment Reconciliation
      </h1>
      <p className="mt-1 text-sm text-muted-ink">
        Verify and reconcile payment settlement states against provider transaction logs.
      </p>
    </div>
  );
}
