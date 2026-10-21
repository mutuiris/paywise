'use client';

import React from 'react';
import Link from 'next/link';
import { Banknote, Scale } from 'lucide-react';
import { SummaryCard } from '@/components/common/SummaryCard';
import {
  FinanceActivityTable,
  QueueItem,
  AttemptItem,
  FailedItem,
} from './FinanceActivityTable';

const QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'pr4',
    reference: 'PR-000126',
    vendorName: 'PowerHire Kenya',
    amount: 42000,
    paymentMethod: 'MPESA',
    invoiceNumber: 'PH-912',
    accountDetails: 'M-Pesa Paybill 247247 (Acct: POWHIRE-99)',
  },
  {
    id: 'pr5',
    reference: 'PR-000127',
    vendorName: 'Prime Cement Supplies',
    amount: 96500,
    paymentMethod: 'BANK_TRANSFER',
    invoiceNumber: 'PC-5510',
    accountDetails: 'Equity Bank · 0110298374100',
  },
];

const ATTEMPT_ITEMS: AttemptItem[] = [
  {
    id: 'at1',
    paymentRequestId: 'pr6',
    reference: 'PR-000128',
    vendorName: 'BlueLine Plumbing',
    amount: 31200,
    status: 'SUCCEEDED',
    startedAt: '2026-09-30T13:58:00Z',
    providerReference: 'PAY-89201',
  },
  {
    id: 'at2',
    paymentRequestId: 'pr7',
    reference: 'PR-000129',
    vendorName: 'Metro Hardware Ltd.',
    amount: 18750,
    status: 'SUCCEEDED',
    startedAt: '2026-09-28T10:14:00Z',
    providerReference: 'PAY-89202',
  },
  {
    id: 'at3',
    paymentRequestId: 'pr8',
    reference: 'PR-000130',
    vendorName: 'SwiftHaul Logistics',
    amount: 54300,
    status: 'SUCCEEDED',
    startedAt: '2026-09-25T16:20:00Z',
    providerReference: 'PAY-89203',
  },
  {
    id: 'at4',
    paymentRequestId: 'pr9',
    reference: 'PR-000131',
    vendorName: 'Apex Electricals',
    amount: 73900,
    status: 'AMBIGUOUS',
    startedAt: '2026-10-06T11:42:00Z',
    providerReference: 'PAY-89244-REC',
  },
  {
    id: 'at5',
    paymentRequestId: 'pr10',
    reference: 'PR-000132',
    vendorName: 'PowerHire Kenya',
    amount: 28000,
    status: 'FAILED',
    startedAt: '2026-10-07T14:10:00Z',
    providerReference: 'PAY-ERR-404',
  },
];

const FAILED_ITEMS: FailedItem[] = [
  {
    id: 'pr9',
    reference: 'PR-000131',
    vendorName: 'Apex Electricals',
    amount: 73900,
    paymentMethod: 'BANK_TRANSFER',
    failureReason: 'Provider gateway timeout on settlement bridge',
  },
];

export function FinanceDashboard() {
  return (
    <div className="space-y-6 font-serif">
      {/* Top Header without dual approvals / reconciliation subtitle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome back, Faith
          </h1>
          <p className="mt-1 text-sm text-muted-ink">
            Finance Officer Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/finance/payments"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground shadow-2xs hover:bg-brand-deep transition"
          >
            <Banknote className="size-4" />
            <span>Process Payments</span>
          </Link>
          <Link
            href="/finance/reconciliation"
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink hover:bg-canvas transition"
          >
            <Scale className="size-4" />
            <span>Reconciliation</span>
          </Link>
        </div>
      </div>

      {/* 5 KPI SummaryCards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SummaryCard
          label="Awaiting Finance Approval"
          value="2"
          tone="warn"
        />
        <SummaryCard
          label="Ready for Processing"
          value={QUEUE_ITEMS.length}
          tone="brand"
        />
        <SummaryCard
          label="Processing"
          value="1"
          tone="warn"
          hint="Includes unconfirmed"
        />
        <SummaryCard
          label="Paid"
          value="14"
          tone="ok"
        />
        <SummaryCard
          label="Failed"
          value={FAILED_ITEMS.length}
          tone="err"
        />
      </div>

      {/* Tabbed Table Container: Recent, Payment Queue, Failed Attempts */}
      <FinanceActivityTable
        queueItems={QUEUE_ITEMS}
        attemptItems={ATTEMPT_ITEMS}
        failedItems={FAILED_ITEMS}
      />
    </div>
  );
}
