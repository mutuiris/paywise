'use client';

import React from 'react';
import Link from 'next/link';
import { Banknote, Scale } from 'lucide-react';

export function FinanceDashboardHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Welcome back, Faith
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Finance Officer Dashboard
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/finance/payments"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground shadow-2xs hover:bg-brand-deep transition"
        >
          <Banknote className="size-4" />
          <span>Process Payments</span>
        </Link>
        <Link
          href="/finance/reconciliation"
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink hover:bg-canvas transition"
        >
          <Scale className="size-4" />
          <span>Reconciliation</span>
        </Link>
      </div>
    </div>
  );
}
