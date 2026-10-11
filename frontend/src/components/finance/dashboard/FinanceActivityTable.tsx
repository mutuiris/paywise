'use client';

import React, { useState } from 'react';
import { DashboardTableTab, QueueItem, AttemptItem, FailedItem } from './types';
import { FinanceActivityHeader } from './FinanceActivityHeader';
import { RecentAttemptsTable } from './RecentAttemptsTable';
import { PaymentQueueTable } from './PaymentQueueTable';
import { FailedAttemptsTable } from './FailedAttemptsTable';
import { FinanceActivityFooter } from './FinanceActivityFooter';

export type { DashboardTableTab, QueueItem, AttemptItem, FailedItem };

interface FinanceActivityTableProps {
  queueItems: QueueItem[];
  attemptItems: AttemptItem[];
  failedItems: FailedItem[];
}

export function FinanceActivityTable({
  queueItems,
  attemptItems,
  failedItems,
}: FinanceActivityTableProps) {
  const [activeTab, setActiveTab] = useState<DashboardTableTab>('RECENT');
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();

  const attempts = attemptItems.filter((a) => a.reference.toLowerCase().includes(q) || a.vendorName.toLowerCase().includes(q));
  const queue = queueItems.filter((r) => r.reference.toLowerCase().includes(q) || r.vendorName.toLowerCase().includes(q));
  const failed = failedItems.filter((f) => f.reference.toLowerCase().includes(q) || f.vendorName.toLowerCase().includes(q));
  const count = activeTab === 'RECENT' ? attempts.length : activeTab === 'QUEUE' ? queue.length : failed.length;

  return (
    <section className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs">
      <FinanceActivityHeader activeTab={activeTab} setActiveTab={setActiveTab} search={search} setSearch={setSearch} counts={{ recent: attemptItems.length, queue: queueItems.length, failed: failedItems.length }} />
      <div className="overflow-x-auto">
        {activeTab === 'RECENT' && <RecentAttemptsTable items={attempts} />}
        {activeTab === 'QUEUE' && <PaymentQueueTable items={queue} />}
        {activeTab === 'FAILED' && <FailedAttemptsTable items={failed} />}
      </div>
      <FinanceActivityFooter activeTab={activeTab} entryCount={count} />
    </section>
  );
}
