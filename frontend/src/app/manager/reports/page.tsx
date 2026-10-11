'use client';

import { useState } from 'react';

interface ReportMetric {
  title: string;
  value: string;
  change: string;
  description: string;
}

interface SummaryRow {
  id: string;
  department: string;
  totalSpent: string;
  approvedCount: number;
  flaggedCount: number;
  status: 'Compliant' | 'Review Needed';
}

const METRICS: ReportMetric[] = [
  { title: 'Total Volume Approved', value: 'KES 1,240,000', change: '+12%', description: 'Compared to last month' },
  { title: 'Avg. Approval Time', value: '4.2 Hours', change: '-18%', description: 'Faster turnaround time' },
  { title: 'Secondary Sign-offs', value: '14 Requests', change: 'KES > 50k', description: 'Routed to Finance' },
  { title: 'Policy Compliance', value: '98.5%', change: 'Stable', description: '0 self-approvals detected' },
];

const DEPARTMENT_SUMMARY: SummaryRow[] = [
  { id: 'DEP-01', department: 'Engineering & IT', totalSpent: 'KES 450,000', approvedCount: 12, flaggedCount: 0, status: 'Compliant' },
  { id: 'DEP-02', department: 'Operations & Facilities', totalSpent: 'KES 310,000', approvedCount: 8, flaggedCount: 1, status: 'Review Needed' },
  { id: 'DEP-03', department: 'Marketing & Comms', totalSpent: 'KES 280,000', approvedCount: 6, flaggedCount: 0, status: 'Compliant' },
  { id: 'DEP-04', department: 'Human Resources', totalSpent: 'KES 200,000', approvedCount: 5, flaggedCount: 0, status: 'Compliant' },
];

export default function ReportsPage() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Page Title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial & Approval Reports</h1>
          <p className="mt-1 text-sm text-gray-400">
            Overview of department spend, threshold distribution, and approval SLA metrics.
          </p>
        </div>
        <button
          onClick={() => alert('Exporting report as CSV...')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          Export CSV
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <div key={metric.title} className="rounded-lg border border-gray-800 bg-gray-900 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{metric.title}</p>
            <p className="mt-2 text-2xl font-bold text-white">{metric.value}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-green-400">{metric.change}</span>
              <span className="text-gray-500">{metric.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Department Summary Table */}
      <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Department Spend Summary</h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="compliant">Compliant Only</option>
              <option value="review">Review Needed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/50 text-xs uppercase text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-3">Dept ID</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Total Approved Spend</th>
                <th className="px-6 py-3">Approved Requests</th>
                <th className="px-6 py-3">Flagged Issues</th>
                <th className="px-6 py-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {DEPARTMENT_SUMMARY.filter((row) => {
                if (filter === 'compliant') return row.status === 'Compliant';
                if (filter === 'review') return row.status === 'Review Needed';
                return true;
              }).map((row) => (
                <tr key={row.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{row.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{row.department}</td>
                  <td className="px-6 py-4 font-semibold text-white">{row.totalSpent}</td>
                  <td className="px-6 py-4">{row.approvedCount}</td>
                  <td className="px-6 py-4">{row.flaggedCount}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.status === 'Compliant'
                          ? 'bg-green-950 text-green-400 border border-green-800'
                          : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                      }`}
                    >
                      {row.status}
                    </span>
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
