'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DashboardTableTab } from './types';

interface FinanceActivityFooterProps {
  activeTab: DashboardTableTab;
  entryCount: number;
}

export function FinanceActivityFooter({
  activeTab,
  entryCount,
}: FinanceActivityFooterProps) {
  const isRecent = activeTab === 'RECENT';
  return (
    <div className="flex items-center justify-between border-t border-line bg-canvas/40 px-5 py-3 text-xs text-muted-ink font-serif">
      <span>Showing {entryCount} entries</span>
      <Link
        href={isRecent ? '/finance/reconciliation' : '/finance/payments'}
        className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
      >
        <span>{isRecent ? 'View all in Reconciliation' : 'Open Payment Processing page'}</span>
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
