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

  const handleRejectSubmit = (reason: string) => {
    if (!rejectModalItem) return;
    setQueue((prev) =>
      prev.map((req) =>
        req.id === rejectModalItem.id ? { ...req, status: 'Rejected' } : req
      )
    );
    setRejectModalItem(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
  <h1 className="text-2xl font-bold text-white">Approvals Queue</h1>
  <p className="mt-1 text-sm text-gray-400">
    Review pending payment requests. Requests &gt; KES 50,000 require secondary Finance sign-off.
    </p>
            </div>
        <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md text-xs text-blue-800">
          Logged in as: <span className="font-semibold">{CURRENT_USER.name}</span> ({CURRENT_USER.role})
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Request ID</th>
              <th className="px-4 py-3">Requester</th>
              <th className="px-4 py-3">Vendor &amp; Notes</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Approval Level</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {queue.map((req) => {
              const isSelfAuthored = req.created_by === CURRENT_USER.id;
              const isHighValue = req.amount > 50000;

              return (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{req.id}</td>
                  <td className="px-4 py-3 text-gray-700">{req.author_name}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{req.vendor_name}</div>
                    <div className="text-xs text-gray-500">{req.description}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {req.currency} {req.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {isHighValue ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        &gt; KES 50k (Manager + Finance)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        &le; KES 50k (Manager Only)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {req.status !== 'Pending Manager Approval' ? (
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                          req.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : req.status === 'Pending Finance Approval'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    ) : isSelfAuthored ? (
                      <span className="text-xs italic text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
                        Self-authored — Approval restricted to other managers
                      </span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModalItem(req)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rejectModalItem && (
        <RejectionModal
          requestId={rejectModalItem.id}
          vendorName={rejectModalItem.vendor_name}
          onClose={() => setRejectModalItem(null)}
          onSubmit={handleRejectSubmit}
        />
      )}
    </div>
  );
}