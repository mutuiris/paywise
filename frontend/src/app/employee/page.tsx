'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  PlusCircle, 
  FileText,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const MOCK_EMPLOYEE_REQUESTS = [
  {
    id: 'PR-000128',
    vendor: 'BlueLine Plumbing',
    amount: 31200,
    status: 'Succeeded',
    providerRef: 'PAY-89201',
    date: '30 Sept 2026, 16:58',
  },
  {
    id: 'PR-000129',
    vendor: 'Metro Hardware Ltd.',
    amount: 18750,
    status: 'Succeeded',
    providerRef: 'PAY-89202',
    date: '28 Sept 2026, 13:14',
  },
  {
    id: 'PR-000130',
    vendor: 'SwiftHaul Logistics',
    amount: 54300,
    status: 'Succeeded',
    providerRef: 'PAY-89203',
    date: '25 Sept 2026, 19:20',
  },
  {
    id: 'PR-000131',
    vendor: 'Apex Electricals',
    amount: 73900,
    status: 'Unconfirmed',
    providerRef: 'PAY-89244-REC',
    date: '06 Oct 2026, 14:42',
  },
];

function EmployeeDashboardContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';

  const filteredRequests = MOCK_EMPLOYEE_REQUESTS.filter(
    (req) =>
      req.vendor.toLowerCase().includes(query) ||
      req.id.toLowerCase().includes(query) ||
      req.providerRef.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-6">
      {/* Title Header with Serif Font */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Welcome back, Bernadette
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Site Engineer Dashboard & Request Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/employee/requests/new"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Process Requests</span>
          </Link>
          <Link
            href="/employee/reports"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-colors text-sm"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span>Summary</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-900">Pending Approval</p>
          <p className="text-2xl font-bold text-gray-900 mt-3">2</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-900">Ready for Processing</p>
          <p className="text-2xl font-bold text-gray-900 mt-3">2</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-900">Processing</p>
          <p className="text-2xl font-bold text-gray-900 mt-3">1</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-900">Paid</p>
          <p className="text-2xl font-bold text-gray-900 mt-3">14</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-900">Failed</p>
          <p className="text-2xl font-bold text-gray-900 mt-3">1</p>
        </div>
      </div>

      {/* Requests Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Payment Attempts</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest gateway outcomes and transaction audit records
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">
            <button className="px-3 py-1.5 bg-white text-gray-900 rounded-md shadow-xs font-semibold">
              Recent (5)
            </button>
            <button className="px-3 py-1.5 hover:text-gray-900">
              Payment Queue (2)
            </button>
            <button className="px-3 py-1.5 hover:text-gray-900">
              Failed Attempts (1)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-6">Reference</th>
                <th className="py-3 px-6">Vendor</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Outcome</th>
                <th className="py-3 px-6">Provider Ref</th>
                <th className="py-3 px-6">Initiated</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-blue-600">{req.id}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{req.vendor}</td>
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    KES {req.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        req.status === 'Succeeded'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {req.status === 'Succeeded' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-gray-500">{req.providerRef}</td>
                  <td className="py-4 px-6 text-gray-500">{req.date}</td>
                  <td className="py-4 px-6 text-right">
                    <button className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-200 rounded-lg text-xs transition-colors">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-gray-500 font-serif">Loading dashboard…</div>}>
      <EmployeeDashboardContent />
    </React.Suspense>
  );
}
