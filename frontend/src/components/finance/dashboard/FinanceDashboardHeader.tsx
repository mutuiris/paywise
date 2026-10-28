'use client';

import React from 'react';
import Link from 'next/link';
import { Banknote, Scale } from 'lucide-react';

export function FinanceDashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between font-serif pb-2">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Welcome back, Faith
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Finance Officer Dashboard
        </p>
      </div>
      <div className="flex items-center gap-2.5 sm:ml-auto shrink-0 self-end sm:self-auto">
        <Link
          href="/finance/payments"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-xs sm:text-sm font-semibold text-brand-foreground shadow-xs hover:bg-brand-deep hover:shadow transition-all active:scale-95"
        >
          <Banknote className="size-4 shrink-0" />
          <span>Process Payments</span>
        </Link>
        <Link
          href="/finance/reconciliation"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink shadow-xs hover:bg-canvas hover:border-slate-300 transition-all active:scale-95"
        >
          <Scale className="size-4 shrink-0 text-muted-ink" />
          <span>Reconciliation</span>
        </Link>
      </div>
    </div>
  );
}
