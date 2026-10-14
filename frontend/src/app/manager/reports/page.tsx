import { Metadata } from 'next';
import { Suspense } from 'react';
import { ReportsView } from '@/components/manager/reports';

export const metadata: Metadata = {
  title: 'Reports — ImaraPay',
  description: 'Department spend, SLA metrics, and approval analytics.',
};

function ReportsViewFallback() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-hidden="true">
      <div className="border-b border-line pb-4">
        <div className="h-7 w-64 rounded bg-surface-muted" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-surface-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<ReportsViewFallback />}>
      <ReportsView />
    </Suspense>
  );
}
