import { Metadata } from 'next';
import { Suspense } from 'react';
import { RequestsView } from '@/components/manager/requests';

export const metadata: Metadata = {
  title: 'Payment Requests — ImaraPay',
  description: 'Browse and track all vendor payment requests.',
};

function RequestsViewFallback() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-hidden="true">
      <div className="border-b border-line pb-4">
        <div className="h-7 w-56 rounded bg-surface-muted" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-surface-muted" />
      </div>
      <div className="h-24 rounded-xl border border-line bg-surface" />
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<RequestsViewFallback />}>
      <RequestsView />
    </Suspense>
  );
}
