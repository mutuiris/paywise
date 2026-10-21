'use client';

import { useState, useMemo } from 'react';
import { INITIAL_AUDIT_EVENTS } from '@/data/mock-admin-audit';

export function useAudit() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const actionsList = useMemo(() => Array.from(new Set(INITIAL_AUDIT_EVENTS.map((e) => e.action))).sort(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INITIAL_AUDIT_EVENTS.filter((e) => {
      if (actionFilter !== 'ALL' && e.action !== actionFilter) return false;
      if (!q) return true;
      return (
        e.actorName.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.requestReference && e.requestReference.toLowerCase().includes(q))
      );
    });
  }, [search, actionFilter]);

  const pagedEvents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return {
    search, setSearch: (v: string) => { setSearch(v); setPage(1); },
    actionFilter, setActionFilter: (v: string) => { setActionFilter(v); setPage(1); },
    page, setPage, pageSize, total: filtered.length,
    actionsList, pagedEvents,
    handleClear: () => { setSearch(''); setActionFilter('ALL'); setPage(1); },
  };
}
