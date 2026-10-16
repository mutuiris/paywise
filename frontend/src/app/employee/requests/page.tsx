'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

const MOCK_ALL_REQUESTS = [
  {
    id: 'REQ-1042',
    vendor: 'Metro Hardware Ltd.',
    project: 'Westlands Project',
    amount: 24500,
    invoice: 'INV-1032',
    status: 'Pending',
    date: '2026-10-12',
  },
  {
    id: 'REQ-1038',
    vendor: 'BuildMax Logistics',
    project: 'Westlands Project',
    amount: 85000,
    invoice: 'INV-0988',
    status: 'Approved',
    date: '2026-10-10',
  },
  {
    id: 'REQ-1021',
    vendor: 'Apex Concrete Supplies',
    project: 'Kilimani Site B',
    amount: 140000,
    invoice: 'INV-0941',
    status: 'Paid',
    date: '2026-10-05',
  },
  {
    id: 'REQ-1005',
    vendor: 'Safety First Kenya',
    project: 'Westlands Project',
    amount: 12500,
    invoice: 'INV-0899',
    status: 'Rejected',
    date: '2026-09-28',
  },
  {
    id: 'REQ-0994',
    vendor: 'Nairobi Timber & Hardware',
    project: 'Headquarters Renovation',
    amount: 45000,
    invoice: 'INV-0872',
    status: 'Paid',
    date: '2026-09-20',
  },
];

function EmployeeRequestsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRequests = MOCK_ALL_REQUESTS.filter((req) => {
    const matchesQuery =
      req.vendor.toLowerCase().includes(query) ||
      req.id.toLowerCase().includes(query) ||
      req.invoice.toLowerCase().includes(query) ||
      req.project.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'All' || req.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your submitted site payment requests and invoices.
          </p>
        </div>
        <Link
          href="/employee/requests/new"
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Payment Request</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Pending', 'Approved', 'Paid', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-500 font-medium">
          Showing {filteredRequests.length} requests
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Request ID</th>
                <th className="py-3.5 px-6">Vendor</th>
                <th className="py-3.5 px-6">Project</th>
                <th className="py-3.5 px-6">Invoice Ref</th>
                <th className="py-3.5 px-6">Amount (KES)</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{req.id}</td>
                    <td className="py-4 px-6 text-gray-900 font-medium">{req.vendor}</td>
                    <td className="py-4 px-6 text-gray-600">{req.project}</td>
                    <td className="py-4 px-6 text-gray-500 font-mono text-xs">{req.invoice}</td>
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      KES {req.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          req.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'Paid'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{req.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No requests found matching your filter or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeRequestsPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-gray-500 font-serif">Loading requests…</div>}>
      <EmployeeRequestsContent />
    </React.Suspense>
  );
}
