'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/data/mock-manager-data';
import { SummaryCard } from '@/components/common/SummaryCard';

export interface PaymentAttempt {
  id: string;
  reference: string;
  vendorName: string;
  amount: number;
  status: 'SUCCEEDED' | 'FAILED' | 'AMBIGUOUS';
  providerReference?: string;
  startedAt: string;
  note?: string;
}

const INITIAL_ATTEMPTS: PaymentAttempt[] = [
  {
    id: 'at1',
    reference: 'PR-000128',
    vendorName: 'BlueLine Plumbing',
    amount: 31200,
    status: 'SUCCEEDED',
    providerReference: 'PAY-89201',
    startedAt: '2026-09-30T13:58:00Z',
    note: 'M-Pesa B2C instant settlement verified.',
  },
  {
    id: 'at2',
    reference: 'PR-000129',
    vendorName: 'Metro Hardware Ltd.',
    amount: 18750,
    status: 'SUCCEEDED',
    providerReference: 'PAY-89202',
    startedAt: '2026-09-28T10:14:00Z',
    note: 'M-Pesa B2C instant settlement verified.',
  },
  {
    id: 'at3',
    reference: 'PR-000130',
    vendorName: 'SwiftHaul Logistics',
    amount: 54300,
    status: 'SUCCEEDED',
    providerReference: 'PAY-89203',
    startedAt: '2026-09-25T16:20:00Z',
    note: 'EFT RTGS confirmation ref verified with bank.',
  },
  {
    id: 'at4',
    reference: 'PR-000131',
    vendorName: 'Apex Electricals',
    amount: 73900,
    status: 'AMBIGUOUS',
    startedAt: '2026-10-06T11:42:00Z',
    note: 'Provider socket closed before ACK; pending manual verification.',
  },
  {
    id: 'at5',
    reference: 'PR-000132',
    vendorName: 'PowerHire Kenya',
    amount: 28000,
    status: 'FAILED',
    providerReference: 'PAY-ERR-404',
    startedAt: '2026-10-07T14:10:00Z',
    note: 'Provider service unavailable on mobile wallet endpoint.',
  },
];

export function ReconciliationView() {
  const [attempts, setAttempts] = useState<PaymentAttempt[]>(INITIAL_ATTEMPTS);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const ambiguousCount = attempts.filter((a) => a.status === 'AMBIGUOUS').length;
  const succeededCount = attempts.filter((a) => a.status === 'SUCCEEDED').length;
  const failedCount = attempts.filter((a) => a.status === 'FAILED').length;

  const handleVerify = (attemptId: string) => {
    setVerifyingId(attemptId);
    setTimeout(() => {
      setAttempts((prev) =>
        prev.map((a) =>
          a.id === attemptId
            ? {
                ...a,
                status: 'SUCCEEDED',
                providerReference: 'PAY-89244-REC',
                note: 'Reconciled: Confirmed completed on provider ledger.',
              }
            : a
        )
      );
      setVerifyingId(null);
    }, 1200);
  };

  const filtered = attempts.filter((item) => {
    const matchesSearch =
      item.reference.toLowerCase().includes(search.toLowerCase()) ||
      item.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Payment Reconciliation
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Verify and reconcile payment settlement states against provider transaction logs.
        </p>
      </div>

      {/* Warning Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 shadow-2xs">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p>
          <span className="font-semibold">Reconciliation Rule:</span> Unconfirmed attempts must be verified directly with the provider before retry to prevent duplicate payouts.
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Unconfirmed Attempts"
          value={ambiguousCount}
          hint="Requires provider ledger query"
          tone="warn"
        />
        <SummaryCard
          label="Succeeded Settlements"
          value={succeededCount}
          hint="Confirmed on provider statements"
          tone="ok"
        />
        <SummaryCard
          label="Failed Rejections"
          value={failedCount}
          hint="Rejected or gateway timeout"
          tone="err"
        />
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-line bg-surface shadow-2xs">
        <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
            <input
              type="text"
              placeholder="Search reference or vendor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-line bg-canvas/60 py-1.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted-ink/70 focus:border-brand focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-ink" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink focus:border-brand focus:outline-none"
            >
              <option value="ALL">All Outcomes</option>
              <option value="AMBIGUOUS">Unconfirmed Only</option>
              <option value="SUCCEEDED">Succeeded Only</option>
              <option value="FAILED">Failed Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
              <tr>
                <th className="px-5 py-3">Request</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Outcome</th>
                <th className="px-5 py-3">Provider Ref</th>
                <th className="px-5 py-3">Started</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {filtered.map((item) => (
                <tr key={item.id} className="transition hover:bg-canvas/50">
                  <td className="whitespace-nowrap px-5 py-4 font-serif text-[13px] font-semibold text-brand-deep">
                    {item.reference}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-ink">{item.vendorName}</span>
                    {item.note && (
                      <p className="mt-0.5 text-[11px] text-muted-ink">{item.note}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-serif font-semibold tabular-nums text-ink">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-5 py-4">
                    {item.status === 'SUCCEEDED' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="size-3" />
                        <span>Succeeded</span>
                      </span>
                    ) : item.status === 'AMBIGUOUS' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        <AlertCircle className="size-3" />
                        <span>Unconfirmed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                        <XCircle className="size-3" />
                        <span>Failed</span>
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-serif text-xs text-muted-ink">
                    {item.providerReference || '—'}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-ink">
                    {formatDateTime(item.startedAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {item.status === 'AMBIGUOUS' ? (
                      <button
                        type="button"
                        disabled={verifyingId === item.id}
                        onClick={() => handleVerify(item.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw
                          className={`size-3 ${
                            verifyingId === item.id ? 'animate-spin' : ''
                          }`}
                        />
                        <span>
                          {verifyingId === item.id ? 'Checking…' : 'Re-query'}
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-muted-ink">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
