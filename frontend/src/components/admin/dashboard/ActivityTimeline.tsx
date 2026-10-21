import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AuditEvent } from '@/types/admin';
import { ActivityItem } from './ActivityItem';

export interface ActivityTimelineProps {
  events: AuditEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h2 className="text-base font-bold text-ink">Recent System Activity</h2>
          <p className="text-xs text-muted-ink">Traceable system events across users and workflows</p>
        </div>
        <Link
          href="/admin/audit"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          <span>Full audit log</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="mt-4">
        <ol className="relative ml-2 border-l border-line">
          {events.slice(0, 6).map((event) => (
            <ActivityItem key={event.id} event={event} />
          ))}
        </ol>
      </div>
    </div>
  );
}
