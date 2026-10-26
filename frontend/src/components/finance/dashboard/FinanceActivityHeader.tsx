'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { DashboardTableTab } from './types';

interface FinanceActivityHeaderProps {
  activeTab: DashboardTableTab;
  setActiveTab: (tab: DashboardTableTab) => void;
  search: string;
  setSearch: (s: string) => void;
  counts: { recent: number; queue: number; failed: number };
}

export function FinanceActivityHeader({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  counts,
}: FinanceActivityHeaderProps) {
  const tabs: DashboardTableTab[] = ['RECENT', 'QUEUE', 'FAILED'];
  return (
    <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between bg-surface-subtle font-serif">
      <div>
        <h2 className="text-base font-semibold text-ink">{activeTab === 'RECENT' ? 'Recent Payment Attempts' : activeTab === 'QUEUE' ? 'Payment Processing Queue' : 'Failed Payment Attempts'}</h2>
        <p className="text-xs text-muted-ink mt-0.5">{activeTab === 'RECENT' ? 'Gateway outcomes & audits' : activeTab === 'QUEUE' ? 'Approved payouts queued' : 'Exceptions requiring review'}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[160px] flex-1 sm:w-48 sm:flex-none">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-ink" />
          <input type="text" placeholder="Search table…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-xs text-ink focus:border-brand focus:outline-none" />
        </div>
        <div className="flex rounded-md border border-line bg-canvas p-0.5 text-xs">
          {tabs.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded px-2.5 py-1 font-medium transition cursor-pointer ${activeTab === tab ? 'bg-surface text-ink shadow-xs font-semibold' : 'text-muted-ink hover:text-ink'}`}>
              {tab === 'RECENT' ? `Recent (${counts.recent})` : tab === 'QUEUE' ? `Queue (${counts.queue})` : `Failed (${counts.failed})`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
