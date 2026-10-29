'use client';

import React from 'react';

export function FinanceApprovalsHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-serif">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Approval Queue
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Secondary clearance for disbursements exceeding the KES 50,000 threshold.
        </p>
      </div>
    </div>
  );
}
