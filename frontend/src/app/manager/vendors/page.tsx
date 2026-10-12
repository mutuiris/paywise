import { Metadata } from 'next';
import { Suspense } from 'react';
import { VendorsView } from '@/components/manager/vendors';

export const metadata: Metadata = {
  title: 'Vendors — ImaraPay',
  description: 'Vendor directory and spend overview.',
};

function VendorsViewFallback() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-hidden="true">
      <div className="border-b border-line pb-4">
        <div className="h-7 w-32 rounded bg-surface-muted" />
        <div className="mt-2 h-4 w-72 max-w-full rounded bg-surface-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<VendorsViewFallback />}>
      <VendorsView />
    </Suspense>
  );
}
