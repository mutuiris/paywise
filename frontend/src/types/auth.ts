export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'FINANCE' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  avatar?: string;
  department?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  FINANCE: 'Finance Officer',
  ADMIN: 'Administrator',
};

export const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  EMPLOYEE: 'bg-blue-50 text-blue-700 border-blue-200',
  MANAGER: 'bg-purple-50 text-purple-700 border-purple-200',
  FINANCE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ADMIN: 'bg-amber-50 text-amber-700 border-amber-200',
};
