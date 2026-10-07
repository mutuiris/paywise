import { User } from '@/types/auth';

export const DEMO_PASSWORD = 'imarapay';

export const DEMO_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Mwangi',
    email: 'alice.mwangi@imaraworks.co.ke',
    role: 'EMPLOYEE',
    isActive: true,
    createdAt: '2025-11-04T08:00:00Z',
    department: 'Site Engineering',
  },
  {
    id: 'u2',
    name: 'Brian Otieno',
    email: 'brian.otieno@imaraworks.co.ke',
    role: 'EMPLOYEE',
    isActive: true,
    createdAt: '2025-11-12T08:00:00Z',
    department: 'Field Operations',
  },
  {
    id: 'u3',
    name: 'Carol Wanjiku',
    email: 'carol.wanjiku@imaraworks.co.ke',
    role: 'MANAGER',
    isActive: true,
    createdAt: '2025-09-02T08:00:00Z',
    department: 'Project Management',
  },
  {
    id: 'u4',
    name: 'David Mutua',
    email: 'david.mutua@imaraworks.co.ke',
    role: 'MANAGER',
    isActive: true,
    createdAt: '2025-09-18T08:00:00Z',
    department: 'Site Operations',
  },
  {
    id: 'u5',
    name: 'Faith Njeri',
    email: 'faith.njeri@imaraworks.co.ke',
    role: 'FINANCE',
    isActive: true,
    createdAt: '2025-08-14T08:00:00Z',
    department: 'Finance & Treasury',
  },
  {
    id: 'u6',
    name: 'Grace Kamau',
    email: 'grace.kamau@imaraworks.co.ke',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2025-07-01T08:00:00Z',
    department: 'IT & Administration',
  },
];
