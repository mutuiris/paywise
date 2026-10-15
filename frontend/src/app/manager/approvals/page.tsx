'use client';

import React, { useState } from 'react';
import { RejectionModal } from '@/components/approvals/RejectionModal';
const CURRENT_USER = {
  id: 'usr_mgr_01',
  name: 'David Mutua',
  role: 'Manager',
};

interface PaymentRequest {
  id: string;
  created_by: string;
  author_name: string;
  vendor_name: string;
  amount: number;
  currency: string;
  description: string;
  status: 'Pending Manager Approval' | 'Pending Finance Approval' | 'Approved' | 'Rejected';
  submitted_at: string;
}

const MOCK_APPROVAL_QUEUE: PaymentRequest[] = [
  {
    id: 'REQ-1001',
    created_by: 'usr_emp_05',
    author_name: 'Alice Kamau',
    vendor_name: 'Safaricom PLC',
    amount: 35000,
    currency: 'KES',
    description: 'Monthly office internet connection bundle renewal',
    status: 'Pending Manager Approval',
    submitted_at: '2026-10-07 09:30',
  },
  {
    id: 'REQ-1002',
    created_by: 'usr_mgr_01', // Self-authored
    author_name: 'David Mutua',
    vendor_name: 'Dell Kenya Ltd',
    amount: 120000,
    currency: 'KES',
    description: 'Replacement developer laptop for engineering hire',
    status: 'Pending Manager Approval',
    submitted_at: '2026-10-07 11:15',
  },
  {
    id: 'REQ-1003',
    created_by: 'usr_emp_09',
    author_name: 'Brian Omondi',
    vendor_name: 'Stationery World Nyeri',
    amount: 78000,
    currency: 'KES',
    description: 'Quarterly office printing supplies & printer maintenance',
    status: 'Pending Manager Approval',
    submitted_at: '2026-10-08 08:00',
  },
];

export default function ApprovalsPage() {
  const [queue, setQueue] = useState<PaymentRequest[]>(MOCK_APPROVAL_QUEUE);
  const [rejectModalItem, setRejectModalItem] = useState<PaymentRequest | null>(null);

  const handleApprove = (requestId: string) => {
    setQueue((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const isHighValue = req.amount > 50000;
          return {
            ...req,
            status: isHighValue ? 'Pending Finance Approval' : 'Approved',
          };
        }
        return req;
      })
    );
  };

  const handleRejectSubmit = (_reason: string) => {
    void _reason;
    if (!rejectModalItem) return;
    setQueue((prev) =>
      prev.map((req) =>
        req.id === rejectModalItem.id ? { ...req, status: 'Rejected' } : req
      )
    );
    setRejectModalItem(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-hidden="true">
      <div className="border-b border-line pb-4">
        <div className="h-7 w-44 rounded bg-surface-muted" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-surface-muted" />
      </div>
      <div className="h-24 rounded-lg border border-line bg-surface" />
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense fallback={<ApprovalsViewFallback />}>
      <ApprovalsView />
    </Suspense>
  );
}
