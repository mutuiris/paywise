'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../common/PageHeader';
import { AdminStats } from './AdminStats';
import { AdminQuickActions } from './AdminQuickActions';
import { ActivityTimeline } from './ActivityTimeline';
import { getAdminOverviewStats } from '@/data/mock-admin-store';
import { INITIAL_AUDIT_EVENTS } from '@/data/mock-admin-audit';
import { AuditEvent, AdminOverviewStats } from '@/types/admin';
import { auditService, reportingService, userService, vendorService } from '@/lib/api/services';
import { DEMO_MODE } from '@/lib/config';
import { getClientUser } from '@/lib/auth/session';
import { toAuditEvent } from '../audit/useAudit';
import { RefreshCw, AlertCircle } from 'lucide-react';

const EMPTY_STATS: AdminOverviewStats = { totalUsers: 0, activeUsers: 0, totalVendors: 0, totalRequests: 0 };

export function AdminDashboard() {
  const [currentUser] = useState(() => getClientUser());
  const [stats, setStats] = useState<AdminOverviewStats>(EMPTY_STATS);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        setStats(getAdminOverviewStats());
        setEvents(INITIAL_AUDIT_EVENTS);
        return;
      }
      const [auditRes, reportRes, vendorsRes, usersRes] = await Promise.all([
        auditService.listEvents({ limit: '10' }),
        reportingService.getSummary(),
        vendorService.listVendors(),
        userService.list(),
      ]);
      setEvents((auditRes.results ?? []).map(toAuditEvent));
      setStats({
        totalUsers: usersRes.results.length,
        activeUsers: usersRes.results.filter((u) => u.is_active).length,
        totalVendors: vendorsRes.vendors?.length ?? 0,
        totalRequests: reportRes.total_requests_count ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the administrator overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    fetchAdminData();
  }, [fetchAdminData]);

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
          onClick={fetchAdminData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition shadow-2xs"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Overview</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      <AdminStats stats={stats} />
      <AdminQuickActions />
      <ActivityTimeline events={events} />
    </div>
  );
}
