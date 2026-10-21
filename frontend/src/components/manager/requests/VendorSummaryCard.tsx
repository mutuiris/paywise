import React from 'react';
import Link from 'next/link';
import { Building2, ExternalLink } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';

interface VendorSummaryCardProps {
  request: PaymentRequestItem;
  basePath?: string;
}

export function VendorSummaryCard({ request, basePath = '/manager' }: VendorSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs text-xs space-y-2.5">
      <h4 className="font-bold text-ink uppercase tracking-wider border-b border-line pb-1.5 flex items-center gap-1.5">
        <Building2 className="size-3.5 text-brand" />
        <span>Vendor Profile</span>
      </h4>
      <p className="font-semibold text-ink text-sm">{request.vendorName}</p>
      <p className="text-muted-ink">
        Channel:{' '}
        <strong className="text-ink">
          {request.paymentMethod === 'MPESA' ? 'M-Pesa Payout' : 'Bank'}
        </strong>
      </p>
      <Link
        href={`${basePath}/vendors`}
        className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1 mt-1"
      >
        <span>View full vendor profile</span>
        <ExternalLink className="size-3" />
      </Link>
    </div>
  );
}
