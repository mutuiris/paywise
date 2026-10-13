import { INITIAL_ADMIN_USERS } from './mock-admin-users';
import { MOCK_VENDORS, INITIAL_PAYMENT_REQUESTS } from './mock-manager-data';
import { AdminOverviewStats } from '@/types/admin';

export function getAdminOverviewStats(): AdminOverviewStats {
  return {
    totalUsers: INITIAL_ADMIN_USERS.length,
    activeUsers: INITIAL_ADMIN_USERS.filter((u) => u.isActive).length,
    totalVendors: MOCK_VENDORS.length,
    totalRequests: INITIAL_PAYMENT_REQUESTS.length,
  };
}

export function formatAuditDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
