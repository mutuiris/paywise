'use client';

import React from 'react';
import { PaymentStatus } from '@/types/manager';

interface StatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; bg: string; dot: string }
> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-canvas text-muted-ink border-line',
    dot: 'bg-muted-ink',
  },
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-canvas text-ink border-line',
    dot: 'bg-muted-ink',
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    bg: 'bg-warn/10 text-warn border-warn/30',
    dot: 'bg-warn',
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-brand/10 text-brand-deep border-brand/30',
    dot: 'bg-brand',
  },
  PROCESSING: {
    label: 'Processing',
    bg: 'bg-info/10 text-info border-info/30',
    dot: 'bg-info',
  },
  PAID: {
    label: 'Paid',
    bg: 'bg-ok/10 text-ok border-ok/30',
    dot: 'bg-ok',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-err/10 text-err border-err/30',
    dot: 'bg-err',
  },
  FAILED: {
    label: 'Failed',
    bg: 'bg-err/10 text-err border-err/30',
    dot: 'bg-err',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.SUBMITTED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium font-serif ${config.bg} ${className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
