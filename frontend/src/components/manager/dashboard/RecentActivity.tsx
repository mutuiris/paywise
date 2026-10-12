'use client';

import React from 'react';
import { ActivityEvent } from '@/types/manager';
import { formatDateTime } from '@/data/mock-manager-data';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RecentActivityProps {
  events: ActivityEvent[];
}

export function RecentActivity({ events }: RecentActivityProps) {
  return (
    <section className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs font-serif">
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

      <ul className="divide-y divide-line">
        {events.slice(0, 5).map((evt) => {
          const isApproved = evt.action.toLowerCase().includes('approved');
          const isRejected = evt.action.toLowerCase().includes('rejected');

          return (
            <li key={evt.id} className="p-4 hover:bg-slate-50/90 active:bg-slate-100 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
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

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {evt.action}
                      <span className="ml-2 font-mono text-xs font-normal text-brand">
                        {evt.requestReference}
                      </span>
                    </p>
                    <time className="text-[11px] text-muted-ink whitespace-nowrap">
                      {formatDateTime(evt.at)}
                    </time>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-ink">
                    {evt.description}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                    Actor: <span className="text-ink">{evt.actorName}</span>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
