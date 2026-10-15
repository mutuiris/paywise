import React from 'react';
import Link from 'next/link';
import { AuditEvent } from '@/types/admin';
import { formatAuditDate } from '@/data/mock-admin-store';

export interface ActivityItemProps {
  event: AuditEvent;
}

export function ActivityItem({ event }: ActivityItemProps) {
  const isErr = /fail|reject/i.test(event.action);
  const isWarn = /deactivat|unconfirmed/i.test(event.action);
  const dotColor = isErr ? 'bg-err' : isWarn ? 'bg-warn' : 'bg-brand';

  return (
    <li className="relative pb-5 pl-5 last:pb-0">
      <span
        aria-hidden="true"
        className={`absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2 border-surface ${dotColor}`}
      />
      <div className="flex flex-wrap items-baseline gap-x-2">
        <p className="text-sm font-semibold text-ink">{event.action}</p>
        <time className="text-[12px] text-muted-ink" dateTime={event.at}>
          {formatAuditDate(event.at)}
        </time>
      </div>
      <p className="text-[13px] text-muted-ink">
        <span className="font-medium text-ink">{event.actorName}</span> · {event.description}
      </p>
      {event.paymentRequestId && (
        <div className="mt-1">
          <Link
            href={`/admin/requests/${event.paymentRequestId}`}
            className="font-mono text-xs text-brand hover:underline"
          >
            Ref: {event.requestReference || event.paymentRequestId}
          </Link>
        </div>
      )}
    </li>
  );
}
