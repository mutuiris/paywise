export interface PendingFinanceApproval {
  id: string;
  reference: string;
  vendorName: string;
  amount: number;
  reason: string;
  requesterId?: string;
  requesterName: string;
  project: string;
  managerApprovedBy: string;
  managerApprovedAt: string;
  invoiceNumber: string;
}

export const MOCK_FINANCE_APPROVALS: PendingFinanceApproval[] = [
  {
    id: 'fa1',
    reference: 'PR-000125',
    vendorName: 'Prime Cement Supplies',
    amount: 96500,
    reason: 'Bulk cement supply for foundational footing',
    requesterName: 'Faith Njeri',
    project: 'Nairobi HQ Tower',
    managerApprovedBy: 'Carol Wanjiku',
    managerApprovedAt: '2026-10-06T14:20:00Z',
    invoiceNumber: 'INV-4410',
  },
  {
    id: 'fa2',
    reference: 'PR-000124',
    vendorName: 'SwiftHaul Logistics',
    amount: 73900,
    reason: 'Site clearance and earthmoving plant transport',
    requesterName: 'James Kariuki',
    project: 'Kisumu Depot',
    managerApprovedBy: 'Carol Wanjiku',
    managerApprovedAt: '2026-10-06T11:45:00Z',
    invoiceNumber: 'INV-8821',
  },
];
