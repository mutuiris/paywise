'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/data/mock-manager-data';

export type DashboardTableTab = 'RECENT' | 'QUEUE' | 'FAILED';

export interface QueueItem {
  id: string;
  reference: string;
  vendorName: string;
  amount: number;
  invoiceNumber: string;
  paymentMethod: 'MPESA' | 'BANK_TRANSFER';
  accountDetails: string;
}

export interface AttemptItem {
  id: string;
  paymentRequestId: string;
  reference: string;
  vendorName: string;
  amount: number;
  status: 'SUCCEEDED' | 'FAILED' | 'AMBIGUOUS' | 'PROCESSING';
  startedAt: string;
  providerReference?: string;
}

export interface FailedItem {
  id: string;
  reference: string;
  vendorName: string;
  amount: number;
  paymentMethod: 'MPESA' | 'BANK_TRANSFER';
  failureReason: string;
}

interface FinanceActivityTableProps {
  queueItems: QueueItem[];
  attemptItems: AttemptItem[];
  failedItems: FailedItem[];
}

export function FinanceActivityTable({
  queueItems,
  attemptItems,
  failedItems,
}: FinanceActivityTableProps) {
  const [activeTab, setActiveTab] = useState<DashboardTableTab>('RECENT');
  const [search, setSearch] = useState('');

  const getStatusBadge = (status: AttemptItem['status']) => {
    switch (status) {
      case 'SUCCEEDED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 text-[11px] font-medium text-ok">
            <CheckCircle2 className="size-3" />
            <span>Succeeded</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-err/30 bg-err/10 px-2 py-0.5 text-[11px] font-medium text-err">
            <XCircle className="size-3" />
            <span>Failed</span>
          </span>
        );
      case 'AMBIGUOUS':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn">
            <AlertCircle className="size-3" />
            <span>Unconfirmed</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn">
            Processing
          </span>
        );
    }
  };

  // Filter items based on active tab and search query
  const q = search.toLowerCase();

  const filteredAttempts = attemptItems.filter(
    (a) =>
      a.reference.toLowerCase().includes(q) ||
      a.vendorName.toLowerCase().includes(q) ||
      (a.providerReference && a.providerReference.toLowerCase().includes(q))
  );

  const filteredQueue = queueItems.filter(
    (row) =>
      row.reference.toLowerCase().includes(q) ||
      row.vendorName.toLowerCase().includes(q) ||
      row.invoiceNumber.toLowerCase().includes(q)
  );

  const filteredFailed = failedItems.filter(
    (f) =>
      f.reference.toLowerCase().includes(q) ||
      f.vendorName.toLowerCase().includes(q) ||
      f.failureReason.toLowerCase().includes(q)
  );

  return (
    <section className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs font-serif">
      {/* Table Header & Segmented Tabs */}
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between bg-surface-subtle">
        <div>
          <h2 className="text-base font-semibold text-ink">
            {activeTab === 'RECENT'
              ? 'Recent Payment Attempts'
              : activeTab === 'QUEUE'
              ? 'Payment Processing Queue'
              : 'Failed Payment Attempts'}
          </h2>
          <p className="text-xs text-muted-ink mt-0.5">
            {activeTab === 'RECENT'
              ? 'Latest gateway outcomes and transaction audit records'
              : activeTab === 'QUEUE'
              ? 'Approved requisitions queued for disbursement trigger'
              : 'Payment exceptions requiring verification before retry'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[180px] flex-1 sm:w-56 sm:flex-none">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-ink" />
            <input
              type="text"
              placeholder="Search in table…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-muted-ink/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 font-serif"
            />
          </div>

          {/* Buttons: Recent, Payment Queue, Failed Attempts */}
          <div className="flex rounded-md border border-line bg-canvas p-0.5 text-xs font-serif">
            <button
              type="button"
              onClick={() => setActiveTab('RECENT')}
              className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                activeTab === 'RECENT'
                  ? 'bg-surface text-ink shadow-xs font-semibold'
                  : 'text-muted-ink hover:text-ink'
              }`}
            >
              Recent ({attemptItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('QUEUE')}
              className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                activeTab === 'QUEUE'
                  ? 'bg-surface text-ink shadow-xs font-semibold'
                  : 'text-muted-ink hover:text-ink'
              }`}
            >
              Payment Queue ({queueItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FAILED')}
              className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                activeTab === 'FAILED'
                  ? 'bg-surface text-ink shadow-xs font-semibold text-err'
                  : 'text-muted-ink hover:text-ink'
              }`}
            >
              Failed Attempts ({failedItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Content Based on Selected Tab */}
      <div className="overflow-x-auto">
        {activeTab === 'RECENT' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Outcome</th>
                <th className="px-5 py-3">Provider Ref</th>
                <th className="px-5 py-3">Initiated</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs text-muted-ink">
                    No matching recent payment attempts found.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((item) => (
                  <tr key={item.id} className="transition hover:bg-canvas/50">
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <Link
                        href={`/finance/requests/${item.paymentRequestId}`}
                        className="font-serif text-[13px] font-semibold text-brand hover:underline"
                      >
                        {item.reference}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink">
                      {item.vendorName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">{getStatusBadge(item.status)}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-serif text-xs text-muted-ink">
                      {item.providerReference || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                      {formatDateTime(item.startedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href="/finance/reconciliation"
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink hover:bg-canvas transition shadow-2xs"
                      >
                        <Eye className="size-3 text-muted-ink" />
                        <span>Reconciliation</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'QUEUE' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Payout Destination</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-muted-ink">
                    No approved payments currently queued.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((row) => (
                  <tr key={row.id} className="transition hover:bg-canvas/50">
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <Link
                        href={`/finance/requests/${row.id}`}
                        className="font-serif text-[13px] font-semibold text-brand hover:underline"
                      >
                        {row.reference}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink">
                      {row.vendorName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-serif text-xs text-muted-ink">
                      {row.invoiceNumber}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-ink">
                      <span className="font-semibold text-ink">
                        {row.paymentMethod === 'MPESA' ? 'M-Pesa B2C' : 'Bank Wire'}
                      </span>
                      <div className="text-[11px]">{row.accountDetails}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href="/finance/payments"
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition"
                      >
                        <Banknote className="size-3" />
                        <span>Disburse</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'FAILED' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Failure Reason</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {filteredFailed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-muted-ink">
                    No failed payments recorded.
                  </td>
                </tr>
              ) : (
                filteredFailed.map((f) => (
                  <tr key={f.id} className="transition hover:bg-canvas/50">
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <Link
                        href={`/finance/requests/${f.id}`}
                        className="font-serif text-[13px] font-semibold text-err hover:underline"
                      >
                        {f.reference}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-ink">
                      {f.vendorName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">
                      {formatCurrency(f.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-ink">
                      <span className="inline-block rounded-xs bg-canvas px-1.5 py-0.5 font-medium text-ink">
                        {f.paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank Transfer'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-err font-medium">
                      {f.failureReason}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href="/finance/payments"
                        className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:bg-canvas transition"
                      >
                        <RotateCcw className="size-3" />
                        <span>Review Payout</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex items-center justify-between border-t border-line bg-canvas/40 px-5 py-3 text-xs text-muted-ink">
        <span>
          Showing {activeTab === 'RECENT' ? filteredAttempts.length : activeTab === 'QUEUE' ? filteredQueue.length : filteredFailed.length} entries
        </span>
        <Link
          href={
            activeTab === 'RECENT'
              ? '/finance/reconciliation'
              : '/finance/payments'
          }
          className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
        >
          <span>
            {activeTab === 'RECENT'
              ? 'View all in Reconciliation'
              : 'Open Payment Processing page'}
          </span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </section>
  );
}
