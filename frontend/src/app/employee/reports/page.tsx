'use client';

import React from 'react';
import { 
  Download, 
  Building2, 
  Clock, 
  Banknote
} from 'lucide-react';

const PROJECT_BREAKDOWN = [
  { project: 'Westlands Project', totalRequests: 12, approvedAmount: 485000, pendingAmount: 110000, status: 'Active' },
  { project: 'Kilimani Site B', totalRequests: 8, approvedAmount: 320000, pendingAmount: 45000, status: 'Active' },
  { project: 'Headquarters Renovation', totalRequests: 5, approvedAmount: 150000, pendingAmount: 0, status: 'Completed' },
  { project: 'Eldoret Warehouse Expansion', totalRequests: 3, approvedAmount: 95000, pendingAmount: 25000, status: 'Active' },
];

const MONTHLY_TRENDS = [
  { month: 'July 2026', requests: 4, amount: 180000 },
  { month: 'August 2026', requests: 7, amount: 340000 },
  { month: 'September 2026', requests: 9, amount: 410000 },
  { month: 'October 2026', requests: 8, amount: 390000 },
];

export default function EmployeeReportsPage() {
  const totalSpentAll = PROJECT_BREAKDOWN.reduce((acc, curr) => acc + curr.approvedAmount, 0);
  const totalPendingAll = PROJECT_BREAKDOWN.reduce((acc, curr) => acc + curr.pendingAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense & Request Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Summary analytics of your site expenses, project allocations, and disbursement history.
          </p>
        </div>
        <button
          onClick={() => alert('Downloading report summary as CSV...')}
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm transition-colors text-sm"
        >
          <Download className="w-4 h-4 text-gray-500" />
          <span>Export Summary (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Approved Disbursed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">KES {totalSpentAll.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pending Review</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">KES {totalPendingAll.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Projects</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">3 Sites</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-800 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Project Expense Allocation</h2>
          <p className="text-xs text-gray-500 mt-0.5">Breakdown of approved and pending request amounts across ImaraWorks project sites.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Project Name</th>
                <th className="py-3.5 px-6">Total Requests</th>
                <th className="py-3.5 px-6">Approved Amount (KES)</th>
                <th className="py-3.5 px-6">Pending Amount (KES)</th>
                <th className="py-3.5 px-6">Site Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {PROJECT_BREAKDOWN.map((item) => (
                <tr key={item.project} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-800" />
                    <span>{item.project}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{item.totalRequests}</td>
                  <td className="py-4 px-6 font-semibold text-emerald-600">
                    KES {item.approvedAmount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 font-medium text-amber-600">
                    KES {item.pendingAmount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.status === 'Active'
                          ? 'bg-slate-100 text-slate-800 border-slate-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Submission Trends</h2>
          <p className="text-xs text-gray-500 mt-0.5">Historical overview of request volume and total requested value per month.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Month</th>
                <th className="py-3.5 px-6">Requests Submitted</th>
                <th className="py-3.5 px-6">Total Value (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {MONTHLY_TRENDS.map((trend) => (
                <tr key={trend.month} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{trend.month}</td>
                  <td className="py-4 px-6 text-gray-600">{trend.requests} requests</td>
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    KES {trend.amount.toLocaleString()}
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
