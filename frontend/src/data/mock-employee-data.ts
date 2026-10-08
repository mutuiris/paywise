import { PaymentRequest, MetricStat } from '@/types/dashboard';

export const EMPLOYEE_INFO = {
  name: 'Alice Mwangi',
  role: 'Employee (Requester)',
  department: 'Site Engineering',
  company: 'ImaraWorks Ltd.',
  email: 'alice.mwangi@imaraworks.co.ke',
};

export const EMPLOYEE_STATS: MetricStat[] = [
  { title: 'Total Submitted', value: 'KES 1,240,000', change: '8 total requests', type: 'neutral' },
  { title: 'Pending Approval', value: '3 Requests', change: 'KES 538,000 in review', type: 'warn' },
  { title: 'Approved & Settled', value: 'KES 612,000', change: '4 completed payouts', type: 'ok' },
  { title: 'Requires Action', value: '1 Request', change: 'Clarification requested', type: 'err' },
];

export const MOCK_REQUESTS: PaymentRequest[] = [
  {
    id: 'REQ-2026-104',
    vendor: 'Apex Electricals',
    category: 'Electrical Installation',
    amount: 'KES 148,000',
    rawAmount: 148000,
    date: 'Oct 7, 2026',
    status: 'PENDING_MANAGER',
    invoiceNumber: 'INV-APX-882',
    description: 'Electrical wiring materials for Section B substation',
  },
  {
    id: 'REQ-2026-098',
    vendor: 'Atlas Construction Supplies',
    category: 'Building Materials',
    amount: 'KES 340,000',
    rawAmount: 340000,
    date: 'Oct 5, 2026',
    status: 'PENDING_FINANCE',
    invoiceNumber: 'INV-ATL-409',
    description: 'High tensile reinforcement steel bars',
  },
  {
    id: 'REQ-2026-092',
    vendor: 'Prime Cement Distributors',
    category: 'Raw Materials',
    amount: 'KES 250,000',
    rawAmount: 250000,
    date: 'Sep 29, 2026',
    status: 'PAID',
    invoiceNumber: 'INV-PRM-112',
    description: '500 bags Portland 42.5 cement',
  },
  {
    id: 'REQ-2026-085',
    vendor: 'Nairobi Safety Equipment',
    category: 'PPE & Gear',
    amount: 'KES 50,000',
    rawAmount: 50000,
    date: 'Sep 24, 2026',
    status: 'PAID',
    invoiceNumber: 'INV-NSE-319',
    description: 'Hard hats, boots and high-visibility vests for site crew',
  },
  {
    id: 'REQ-2026-079',
    vendor: 'Rapid Concrete Mixers Ltd',
    category: 'Equipment Rental',
    amount: 'KES 50,000',
    rawAmount: 50000,
    date: 'Sep 18, 2026',
    status: 'REJECTED',
    invoiceNumber: 'INV-RCM-901',
    description: 'Weekend heavy mixer hire (duplicate invoice)',
  },
];
