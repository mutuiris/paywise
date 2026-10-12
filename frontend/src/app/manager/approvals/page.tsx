import { Metadata } from 'next';
import { Suspense } from 'react';
import { ApprovalsView } from '@/components/manager/approvals';

export const metadata: Metadata = {
  title: 'Approvals — ImaraPay',
  description: 'Manager approval queue with threshold routing.',
};

function ApprovalsViewFallback() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-hidden="true">
      <div className="border-b border-line pb-4">
        <div className="h-7 w-44 rounded bg-surface-muted" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-surface-muted" />
      </div>
      <div className="h-24 rounded-lg border border-line bg-surface" />
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense fallback={<ApprovalsViewFallback />}>
      <ApprovalsView />
    </Suspense>
  );
}
