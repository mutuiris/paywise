'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../common/PageHeader';
import { AdminStats } from './AdminStats';
import { AdminQuickActions } from './AdminQuickActions';
import { ActivityTimeline } from './ActivityTimeline';
import { getAdminOverviewStats } from '@/data/mock-admin-store';
import { INITIAL_AUDIT_EVENTS } from '@/data/mock-admin-audit';
import { AuditEvent, AdminOverviewStats } from '@/types/admin';
import { auditService, reportingService, vendorService } from '@/lib/api/services';
import { getClientUser } from '@/lib/auth/session';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function AdminDashboard() {
  const [currentUser] = useState(() => getClientUser());
  const [stats, setStats] = useState<AdminOverviewStats>(getAdminOverviewStats());
  const [events, setEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchAdminData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const [auditRes, reportRes, vendorsRes] = await Promise.allSettled([
        auditService.listEvents({ limit: '10' }),
        reportingService.getSummary(),
        vendorService.listVendors(),
      ]);

      // 1. Audit events
      if (auditRes.status === 'fulfilled' && auditRes.value?.results?.length) {
        const mappedEvents: AuditEvent[] = auditRes.value.results.map((e) => ({
          id: e.id,
          at: e.created_at || new Date().toISOString(),
          actorName: e.actor_email ? e.actor_email.split('@')[0] : 'System Admin',
          action: e.action,
          entity: e.entity_type,
          paymentRequestId: e.entity_type === 'PAYMENT_REQUEST' ? e.entity_id : undefined,
          requestReference: e.entity_id ? e.entity_id.slice(0, 8).toUpperCase() : undefined,
          description: e.description,
        }));
        setEvents(mappedEvents);
      }

      // 2. Metrics & Vendors
      const baseStats = getAdminOverviewStats();
      let totalVendors = baseStats.totalVendors;
      let totalRequests = baseStats.totalRequests;

      if (vendorsRes.status === 'fulfilled' && vendorsRes.value?.vendors) {
        totalVendors = vendorsRes.value.vendors.length;
      }

      if (reportRes.status === 'fulfilled' && reportRes.value) {
        totalRequests = reportRes.value.total_requests_count ?? baseStats.totalRequests;
      }

      setStats({
        ...baseStats,
        totalVendors,
        totalRequests,
      });

      setUsingFallback(false);
    } catch {
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      auditService.listEvents({ limit: '10' }),
      reportingService.getSummary(),
      vendorService.listVendors(),
    ]).then(([auditRes, reportRes, vendorsRes]) => {
      if (ignore) return;
      if (auditRes.status === 'fulfilled' && auditRes.value?.results?.length) {
        const mappedEvents: AuditEvent[] = auditRes.value.results.map((e) => ({
          id: e.id,
          at: e.created_at || new Date().toISOString(),
          actorName: e.actor_email ? e.actor_email.split('@')[0] : 'System Admin',
          action: e.action,
          entity: e.entity_type,
          paymentRequestId: e.entity_type === 'PAYMENT_REQUEST' ? e.entity_id : undefined,
          requestReference: e.entity_id ? e.entity_id.slice(0, 8).toUpperCase() : undefined,
          description: e.description,
        }));
        setEvents(mappedEvents);
      }

      const baseStats = getAdminOverviewStats();
      let totalVendors = baseStats.totalVendors;
      let totalRequests = baseStats.totalRequests;

      if (vendorsRes.status === 'fulfilled' && vendorsRes.value?.vendors) {
        totalVendors = vendorsRes.value.vendors.length;
      }

      if (reportRes.status === 'fulfilled' && reportRes.value) {
        totalRequests = reportRes.value.total_requests_count ?? baseStats.totalRequests;
      }

      setStats({
        ...baseStats,
        totalVendors,
        totalRequests,
      });

      setUsingFallback(false);
      setLoading(false);
    }).catch(() => {
      if (ignore) return;
      setUsingFallback(true);
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Administrator';

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description="Administrator dashboard · System governance and access management"
        />
        <button
          type="button"
          onClick={() => fetchAdminData(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition shadow-2xs"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Overview</span>
        </button>
      </div>

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-subtle p-3 text-xs text-muted-ink">
          <AlertCircle className="size-4 shrink-0 text-muted-ink" />
          <span>Backend governance services unreachable. Showing system snapshot.</span>
        </div>
      )}

      <AdminStats stats={stats} />
      <AdminQuickActions />
      <ActivityTimeline events={events} />
    </div>
  );
}
