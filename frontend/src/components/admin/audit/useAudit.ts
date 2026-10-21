'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_AUDIT_EVENTS } from '@/data/mock-admin-audit';
import { formatAuditAction } from '@/data/mock-admin-store';
import { auditService } from '@/lib/api/services';
import { AuditEvent } from '@/types/admin';

export function useAudit() {
  const [events, setEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const fetchAuditEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const res = await auditService.listEvents();
      if (res && res.results && res.results.length > 0) {
        const mapped: AuditEvent[] = res.results.map((e) => ({
          id: e.id,
          at: e.created_at || new Date().toISOString(),
          actorName: e.actor_email ? e.actor_email.split('@')[0] : 'System User',
          action: e.action,
          entity: e.entity_type,
          paymentRequestId: e.entity_type === 'PAYMENT_REQUEST' ? e.entity_id : undefined,
          requestReference: e.entity_id ? e.entity_id.slice(0, 8).toUpperCase() : undefined,
          description: e.description,
        }));
        setEvents(mapped);
        setUsingFallback(false);
      } else {
        setUsingFallback(true);
      }
    } catch {
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    auditService
      .listEvents()
      .then((res) => {
        if (ignore) return;
        if (res && res.results && res.results.length > 0) {
          const mapped: AuditEvent[] = res.results.map((e) => ({
            id: e.id,
            at: e.created_at || new Date().toISOString(),
            actorName: e.actor_email ? e.actor_email.split('@')[0] : 'System User',
            action: e.action,
            entity: e.entity_type,
            paymentRequestId: e.entity_type === 'PAYMENT_REQUEST' ? e.entity_id : undefined,
            requestReference: e.entity_id ? e.entity_id.slice(0, 8).toUpperCase() : undefined,
            description: e.description,
          }));
          setEvents(mapped);
          setUsingFallback(false);
        } else {
          setUsingFallback(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (ignore) return;
        setUsingFallback(true);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

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
    loading, usingFallback,
    refreshEvents: () => fetchAuditEvents(true),
    handleClear: () => { setSearch(''); setActionFilter('ALL'); setPage(1); },
  };
}
