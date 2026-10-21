export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'FINANCE' | 'ADMIN';

export type Capability =
  | 'requests.create'
  | 'requests.viewAll'
  | 'approvals.view'
  | 'payments.process'
  | 'reconciliation.view'
  | 'vendors.view'
  | 'vendors.manage'
  | 'reports.view'
  | 'audit.view'
  | 'users.manage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department?: string;
  avatarInitials: string;
  approvalLimit?: number;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  FINANCE: 'Finance Officer',
  ADMIN: 'Administrator',
};

export const ROLE_CAPABILITIES: Record<UserRole, Capability[]> = {
  EMPLOYEE: ['requests.create', 'vendors.view'],
  MANAGER: [
    'requests.create',
    'requests.viewAll',
    'approvals.view',
    'vendors.view',
    'reports.view',
  ],
  FINANCE: [
    'requests.viewAll',
    'approvals.view',
    'payments.process',
    'reconciliation.view',
    'reports.view',
    'vendors.view',
  ],
  ADMIN: [
    'requests.viewAll',
    'vendors.view',
    'vendors.manage',
    'reports.view',
    'audit.view',
    'users.manage',
  ],
};

export function hasCapability(role: UserRole, capability?: Capability): boolean {
  if (!capability) return true;
  return ROLE_CAPABILITIES[role]?.includes(capability) ?? false;
}

export const DEMO_USERS: Record<string, UserProfile> = {
  carol: {
    id: 'u3',
    name: 'Carol Wanjiku',
    email: 'carol.wanjiku@imaraworks.co.ke',
    role: 'MANAGER',
    title: 'Manager',
    department: 'Operations & Engineering',
    avatarInitials: 'CW',
    approvalLimit: 50000,
  },
  david: {
    id: 'u4',
    name: 'David Mutua',
    email: 'david.mutua@imaraworks.co.ke',
    role: 'MANAGER',
    title: 'Manager',
    department: 'Civil Infrastructure',
    avatarInitials: 'DM',
    approvalLimit: 50000,
  },
  faith: {
    id: 'u5',
    name: 'Faith Njeri',
    email: 'faith.njeri@imaraworks.co.ke',
    role: 'FINANCE',
    title: 'Finance Officer',
    department: 'Finance & Treasury',
    avatarInitials: 'FN',
  },
  alice: {
    id: 'u1',
    name: 'Alice Mwangi',
    email: 'alice.mwangi@imaraworks.co.ke',
    role: 'EMPLOYEE',
    title: 'Site Engineer',
    department: 'Engineering',
    avatarInitials: 'AM',
  },
  brian: {
    id: 'u2',
    name: 'Brian Otieno',
    email: 'brian.otieno@imaraworks.co.ke',
    role: 'EMPLOYEE',
    title: 'Procurement Assistant',
    department: 'Operations',
    avatarInitials: 'BO',
  },
  grace: {
    id: 'u6',
    name: 'Grace Kamau',
    email: 'grace.kamau@imaraworks.co.ke',
    role: 'ADMIN',
    title: 'System Administrator',
    department: 'IT & Security',
    avatarInitials: 'GK',
  },
};
