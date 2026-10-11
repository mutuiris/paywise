import React from 'react';
import { SummaryCard } from '@/components/common/SummaryCard';

interface Props {
  ambiguousCount: number;
  succeededCount: number;
  failedCount: number;
}

export function ReconciliationStats({
  ambiguousCount,
  succeededCount,
  failedCount,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard
        label="Unconfirmed Attempts"
        value={ambiguousCount}
        hint="Requires provider ledger query"
        tone="warn"
      />
      <SummaryCard
        label="Succeeded Settlements"
        value={succeededCount}
        hint="Confirmed on provider statements"
        tone="ok"
      />
      <SummaryCard
        label="Failed Rejections"
        value={failedCount}
        hint="Rejected or gateway timeout"
        tone="err"
      />
    </div>
  );
}
