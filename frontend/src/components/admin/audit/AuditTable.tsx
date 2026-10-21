import React from 'react';
import { AuditEvent } from '@/types/admin';
import { AuditRow } from './AuditRow';

export function AuditTable({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted-ink">
        No audit events match your search criteria.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Audit Events</caption>
          <thead className="border-b border-line bg-canvas text-[12px] font-semibold text-muted-ink">
            <tr>
              <th className="px-4 py-2.5">Timestamp</th>
              <th className="px-4 py-2.5">Actor</th>
              <th className="px-4 py-2.5">Action</th>
              <th className="px-4 py-2.5">Entity</th>
              <th className="px-4 py-2.5">Request Ref</th>
              <th className="px-4 py-2.5">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {events.map((event) => (
              <AuditRow key={event.id} event={event} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
