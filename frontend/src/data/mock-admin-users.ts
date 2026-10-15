import { AdminUser } from '@/types/admin';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  { id: 'u6', name: 'Grace Kamau', email: 'grace.kamau@imaraworks.co.ke', role: 'ADMIN', department: 'IT & Security', isActive: true, createdAt: '2025-07-01T08:00:00Z' },
  { id: 'u5', name: 'Faith Njeri', email: 'faith.njeri@imaraworks.co.ke', role: 'FINANCE', department: 'Finance & Treasury', isActive: true, createdAt: '2025-08-14T08:00:00Z' },
  { id: 'u3', name: 'Carol Wanjiku', email: 'carol.wanjiku@imaraworks.co.ke', role: 'MANAGER', department: 'Operations & Engineering', isActive: true, createdAt: '2025-09-02T08:00:00Z' },
  { id: 'u4', name: 'David Mutua', email: 'david.mutua@imaraworks.co.ke', role: 'MANAGER', department: 'Civil Infrastructure', isActive: true, createdAt: '2025-09-18T08:00:00Z' },
  { id: 'u1', name: 'Alice Mwangi', email: 'alice.mwangi@imaraworks.co.ke', role: 'EMPLOYEE', department: 'Site Engineering', isActive: true, createdAt: '2025-11-04T08:00:00Z' },
  { id: 'u2', name: 'Brian Otieno', email: 'brian.otieno@imaraworks.co.ke', role: 'EMPLOYEE', department: 'Procurement Assistant', isActive: true, createdAt: '2025-11-12T08:00:00Z' },
];
