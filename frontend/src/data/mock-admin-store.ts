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

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  PAYMENT_REQUEST_CREATED: 'Payment Request Created',
  PAYMENT_REQUEST_SUBMITTED: 'Payment Request Submitted',
  PAYMENT_REQUEST_APPROVED: 'Payment Request Approved',
  PAYMENT_REQUEST_REJECTED: 'Payment Request Rejected',
  PAYMENT_PROCESSING_STARTED: 'Payment Processing Started',
  PAYMENT_COMPLETED: 'Payment Completed',
  PAYMENT_FAILED: 'Payment Failed',
  APPROVAL_INVALIDATED: 'Approval Invalidated',
  VENDOR_CREATED: 'Vendor Created',
  PROJECT_CREATED: 'Project Created',
  USER_ROLE_CHANGED: 'User Role Changed',
};

export function formatAuditAction(action: string): string {
  return AUDIT_ACTION_LABELS[action] || action;
}
