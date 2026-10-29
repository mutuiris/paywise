import React from 'react';
import { FileText } from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import { formatDate } from '@/data/mock-manager-data';

interface RequisitionDetailsCardProps {
  request: PaymentRequestItem;
}

export function RequisitionDetailsCard({ request }: RequisitionDetailsCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs space-y-5">
      <h2 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-line pb-2 flex items-center gap-2">
        <FileText className="size-4 text-brand" />
        <span>Requisition Details</span>
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
        <div className="rounded-lg bg-surface-subtle border border-line p-3">
          <span className="text-xs text-muted-ink block">Project Site</span>
          <span className="font-semibold text-ink mt-0.5 block">{request.project}</span>
        </div>

        <div className="rounded-lg bg-surface-subtle border border-line p-3">
          <span className="text-xs text-muted-ink block">Requested By</span>
          <span className="font-semibold text-ink mt-0.5 block">{request.requesterName}</span>
        </div>

        <div className="rounded-lg bg-surface-subtle border border-line p-3">
          <span className="text-xs text-muted-ink block">Invoice Reference</span>
          <span className="font-serif font-semibold text-ink mt-0.5 block">{request.invoiceNumber}</span>
        </div>

        <div className="rounded-lg bg-surface-subtle border border-line p-3">
          <span className="text-xs text-muted-ink block">Requested Payout Date</span>
          <span className="font-semibold text-ink mt-0.5 block">{formatDate(request.requestedPaymentDate)}</span>
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold text-muted-ink uppercase tracking-wider block">
          Payment Purpose / Description
        </span>
        <p className="mt-1 text-sm font-medium text-ink bg-canvas border border-line rounded-lg p-3">
          {request.reason}
        </p>
      </div>

      {request.notes && (
        <div>
          <span className="text-xs font-semibold text-muted-ink uppercase tracking-wider block">
            Supporting Verification Remarks
          </span>
          <p className="mt-1 text-xs text-muted-ink bg-canvas border border-line rounded-lg p-3">
            {request.notes}
          </p>
        </div>
      )}
    </div>
  );
}
