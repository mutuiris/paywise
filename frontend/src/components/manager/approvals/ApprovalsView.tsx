'use client';

import React, { useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, SearchX } from 'lucide-react';
import { RejectionModal } from '@/components/approvals/RejectionModal';
import { CURRENT_MANAGER } from '@/data/mock-manager-data';

const CURRENT_USER = {
  id: CURRENT_MANAGER.id,
  name: CURRENT_MANAGER.name,
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
    created_by: CURRENT_MANAGER.id, // Self-authored — exercises the self-approval restriction
    author_name: CURRENT_MANAGER.name,
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

function matchesQuery(req: PaymentRequest, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    req.id.toLowerCase().includes(q) ||
    req.author_name.toLowerCase().includes(q) ||
    req.vendor_name.toLowerCase().includes(q) ||
    req.description.toLowerCase().includes(q) ||
    req.status.toLowerCase().includes(q) ||
    String(req.amount).includes(q)
  );
}

export function ApprovalsView() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const searchQuery = searchParams.get('q') ?? '';

  const [queue, setQueue] = useState<PaymentRequest[]>(MOCK_APPROVAL_QUEUE);
  const [rejectModalItem, setRejectModalItem] = useState<PaymentRequest | null>(null);

  const handleQueryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  };

  const filteredQueue = useMemo(
    () => queue.filter((req) => matchesQuery(req, searchQuery.trim())),
    [queue, searchQuery]
  );

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

      {/* Search + results count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="approvals-search" className="sr-only">
            Search approval queue
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-ink"
          />
          <input
            id="approvals-search"
            type="search"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search ID, requester, vendor…"
            className="w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-muted-ink/70 transition-all focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <p className="text-xs text-muted-ink" role="status">
          Showing {filteredQueue.length} of {queue.length} requests
        </p>
      </div>

      {/* Empty state */}
      {filteredQueue.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow">
          <SearchX
            className="mx-auto size-10 text-gray-300"
            aria-hidden="true"
          />
          <h3 className="mt-3 text-sm font-semibold text-gray-900">
            No requests found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Nothing matches &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => handleQueryChange('')}
            className="mt-4 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Clear search
          </button>
        </div>
      ) : (
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
            {filteredQueue.map((req) => {
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
      )}

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
