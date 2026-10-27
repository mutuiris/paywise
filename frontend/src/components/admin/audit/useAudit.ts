'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_AUDIT_EVENTS } from '@/data/mock-admin-audit';
import { formatAuditAction } from '@/data/mock-admin-store';
import { auditService } from '@/lib/api/services';
import type { AuditEventDTO } from '@/lib/api/types';
import { DEMO_MODE } from '@/lib/config';
import { AuditEvent } from '@/types/admin';

export function toAuditEvent(e: AuditEventDTO): AuditEvent {
  return {
    id: e.id,
    at: e.created_at || '',
    actorName: e.actor_email ? e.actor_email.split('@')[0] : 'System',
    action: e.action,
    entity: e.entity_type,
    paymentRequestId: e.entity_type === 'PAYMENT_REQUEST' ? e.entity_id : undefined,
    requestReference: e.entity_id ? e.entity_id.slice(0, 8).toUpperCase() : undefined,
    description: e.description,
  };
}

export function useAudit() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const fetchAuditEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        setEvents(INITIAL_AUDIT_EVENTS);
        return;
      }
      const res = await auditService.listEvents();
      setEvents((res.results ?? []).map(toAuditEvent));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the audit log.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    fetchAuditEvents();
  }, [fetchAuditEvents]);

  const actionsList = useMemo(() => Array.from(new Set(events.map((e) => e.action))).sort(), [events]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (actionFilter !== 'ALL' && e.action !== actionFilter) return false;
      if (!q) return true;
      return (
        e.actorName.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        formatAuditAction(e.action).toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.requestReference && e.requestReference.toLowerCase().includes(q))
      );
    });
  }, [events, search, actionFilter]);

  const pagedEvents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return {
    search, setSearch: (v: string) => { setSearch(v); setPage(1); },
    actionFilter, setActionFilter: (v: string) => { setActionFilter(v); setPage(1); },
    page, setPage, pageSize, total: filtered.length,
    actionsList, pagedEvents,
    loading, error,
    refreshEvents: fetchAuditEvents,
    handleClear: () => { setSearch(''); setActionFilter('ALL'); setPage(1); },
  };
}
