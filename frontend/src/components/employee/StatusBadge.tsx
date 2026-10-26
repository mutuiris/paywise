import React from 'react';
import type { PaymentAttemptStatus, PaymentRequestStatus } from '@/types/domain';

interface BadgeStyle {
  label: string;
  className: string;
}

const REQUEST_STATUS_STYLES: Record<PaymentRequestStatus, BadgeStyle> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  SUBMITTED: { label: 'Submitted', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  APPROVED: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  PROCESSING: { label: 'Processing', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  PAID: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FAILED: { label: 'Failed', className: 'bg-red-50 text-red-700 border-red-200' },
};

const ATTEMPT_STATUS_STYLES: Record<PaymentAttemptStatus, BadgeStyle> = {
  PROCESSING: { label: 'Processing', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  SUCCESS: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FAILED: { label: 'Failed', className: 'bg-red-50 text-red-700 border-red-200' },
  AMBIGUOUS: {
    label: 'Needs reconciliation',
    className: 'bg-amber-50 text-amber-800 border-amber-300',
  },
};

const FALLBACK: BadgeStyle = {
  label: 'Unknown',
  className: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function getPaymentStatusLabel(status: PaymentRequestStatus): string {
  return REQUEST_STATUS_STYLES[status]?.label ?? status;
}

export function PaymentStatusBadge({ status }: { status: PaymentRequestStatus }) {
  const style = REQUEST_STATUS_STYLES[status] ?? { ...FALLBACK, label: status };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export function PaymentAttemptStatusBadge({ status }: { status: PaymentAttemptStatus }) {
  const style = ATTEMPT_STATUS_STYLES[status] ?? { ...FALLBACK, label: status };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.className}`}
    >
      {style.label}
    </span>
  );
}
