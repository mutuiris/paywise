import React from 'react';
import Link from 'next/link';
import { AuditEvent } from '@/types/admin';
import { formatAuditDate } from '@/data/mock-admin-store';

export function AuditRow({ event }: { event: AuditEvent }) {
  const isErr = /fail|reject/i.test(event.action);
  const isWarn = /deactivat|unconfirmed/i.test(event.action);
  const actionColor = isErr ? 'text-err font-semibold' : isWarn ? 'text-warn font-semibold' : 'text-ink font-semibold';

  return (
    <tr className="hover:bg-canvas/50 transition-colors font-serif">
      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-ink">
        {formatAuditDate(event.at)}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-ink">{event.actorName}</td>
      <td className={`px-4 py-3 text-xs ${actionColor}`}>{event.action}</td>
      <td className="px-4 py-3 text-xs text-muted-ink">{event.entity}</td>
      <td className="px-4 py-3">
        {event.paymentRequestId ? (
          <Link
            href={`/admin/requests/${event.paymentRequestId}`}
            className="font-mono text-xs font-medium text-brand hover:underline"
          >
            {event.requestReference || event.paymentRequestId}
          </Link>
        ) : (
          <span className="text-muted-ink">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted-ink max-w-xs truncate" title={event.description}>
        {event.description}
      </td>
    </tr>
  );
}
