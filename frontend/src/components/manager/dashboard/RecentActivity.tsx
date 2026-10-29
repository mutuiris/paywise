'use client';

import React from 'react';
import { ActivityEvent, PaymentRequestItem } from '@/types/manager';
import { formatDateTime } from '@/data/mock-manager-data';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RecentActivityProps {
  events: ActivityEvent[];
  /** Loaded requests, used to resolve an event's request id to vendor and amount. */
  requests?: PaymentRequestItem[];
}

export function RecentActivity({ events, requests = [] }: RecentActivityProps) {
  return (
    <section className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs">
      <div className="border-b border-line px-5 py-4 bg-surface-subtle">
        <h2 className="text-base font-semibold text-ink">Recent Activity & Audit Trail</h2>
        <p className="text-xs text-muted-ink mt-0.5">
          Log of approvals, submissions, and status updates
        </p>
        <div className="mt-2">
          <Link
            href="/manager/reports"
            className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
          >
            <span>Full log</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {events.length === 0 && (
        <p className="px-5 py-6 text-center text-xs text-muted-ink">No activity recorded yet.</p>
      )}
      <ul className="divide-y divide-line">
        {events.slice(0, 5).map((evt) => {
          const isApproved = evt.action.toLowerCase().includes('approved');
          const isRejected = evt.action.toLowerCase().includes('rejected');
          const isSubmitted = evt.action.toLowerCase().includes('submitted');

          let badgeLabel = evt.action;
          let badgeClass = 'bg-slate-100 text-slate-700 border border-slate-200';

          if (isApproved) {
            badgeLabel = 'Approved';
            badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
          } else if (isRejected) {
            badgeLabel = 'Rejected';
            badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';
          } else if (isSubmitted) {
            badgeLabel = 'Submitted';
            badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200';
          }

          // Audit events carry the request id; resolve it against the loaded requests.
          const matchingReq = evt.requestReference
            ? requests.find(
                (r) => r.id === evt.requestReference || r.reference === evt.requestReference
              )
            : null;
          const referenceLabel =
            matchingReq?.reference ||
            (evt.requestReference ? evt.requestReference.slice(0, 8).toUpperCase() : '');

          let vendorName = matchingReq?.vendorName;
          if (!vendorName && evt.description) {
            const parenMatch = evt.description.match(/\(([^—–)]+)/);
            if (parenMatch) {
              vendorName = parenMatch[1].trim();
            } else if (evt.description.includes('for ')) {
              const forMatch = evt.description.split('for ')[1]?.split('(')[0]?.trim();
              if (forMatch) vendorName = forMatch;
            }
          }
          if (!vendorName) {
            vendorName = referenceLabel || 'Payment Activity';
          }

          let amountNumber: number | null = null;
          if (matchingReq) {
            amountNumber = matchingReq.amount;
          } else if (evt.description) {
            const kesMatch = evt.description.match(/KES\s*([\d,]+)/i);
            if (kesMatch) {
              amountNumber = Number(kesMatch[1].replace(/,/g, ''));
            }
          }

          const formattedNumber =
            amountNumber !== null
              ? new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(amountNumber)
              : null;

          return (
            <li key={evt.id} className="p-4 hover:bg-slate-50/90 active:bg-slate-100 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                  {isApproved ? (
                    <span className="grid size-7 place-items-center rounded-full bg-ok/10 text-ok">
                      <CheckCircle2 className="size-4" />
                    </span>
                  ) : isRejected ? (
                    <span className="grid size-7 place-items-center rounded-full bg-err/10 text-err">
                      <XCircle className="size-4" />
                    </span>
                  ) : (
                    <span className="grid size-7 place-items-center rounded-full bg-slate-100 text-muted-ink">
                      <Clock className="size-4" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Main Title: Company Name */}
                    <p className="text-sm font-semibold text-ink truncate">
                      {vendorName}
                    </p>

                    {/* Amount & Reference Code */}
                    {formattedNumber !== null ? (
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-ink">
                          <span className="text-[10px] font-medium text-muted-ink mr-0.5">KES</span>
                          {formattedNumber}
                        </span>
                        {referenceLabel && (
                          <span className="text-[11px] text-muted-ink">({referenceLabel})</span>
                        )}
                      </div>
                    ) : (
                      referenceLabel && (
                        <p className="mt-0.5 text-xs text-muted-ink font-medium">
                          {referenceLabel}
                        </p>
                      )
                    )}

                    {/* Actor */}
                    <p className="mt-1 text-[11px] text-muted-ink">
                      Actor: <span className="text-ink font-medium">{evt.actorName}</span>
                    </p>
                  </div>

                  {/* Top-Right: Date and Action Status Banner */}
                  <div className="flex flex-col items-end shrink-0 text-right">
                    <time className="text-[11px] text-muted-ink whitespace-nowrap">
                      {formatDateTime(evt.at)}
                    </time>
                    <span
                      className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${badgeClass}`}
                    >
                      {badgeLabel}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
