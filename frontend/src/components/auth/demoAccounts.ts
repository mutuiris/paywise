export interface DemoAccount {
  name: string;
  role: string;
  email: string;
  target: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Grace Kamau',
    role: 'Administrator',
    email: 'grace.kamau@imaraworks.co.ke',
    target: '/admin/dashboard',
  },
  {
    name: 'Faith Njeri',
    role: 'Finance Officer',
    email: 'faith.njeri@imaraworks.co.ke',
    target: '/finance/dashboard',
  },
  {
    name: 'Carol Wanjiku',
    role: 'Manager',
    email: 'carol.wanjiku@imaraworks.co.ke',
    target: '/manager/dashboard',
  },
  {
    name: 'David Mutua',
    role: 'Manager',
    email: 'david.mutua@imaraworks.co.ke',
    target: '/manager/dashboard',
  },
  {
    name: 'Alice Mwangi',
    role: 'Employee',
    email: 'alice.mwangi@imaraworks.co.ke',
    target: '/finance/dashboard',
  },
];
