import { UserRole } from './auth';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actorName: string;
  action: string;
  entity: string;
  paymentRequestId?: string;
  requestReference?: string;
  description: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  activeUsers: number;
  totalVendors: number;
  totalRequests: number;
}
