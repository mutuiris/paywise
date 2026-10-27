'use client';

import React, { useMemo } from 'react';
import { Download, Building2, Clock, Banknote } from 'lucide-react';
import { useApiResource } from '@/hooks/useApiResource';
import { listPaymentRequests } from '@/api/payments';
import { listProjects } from '@/api/vendors';
import {
  DemoDataBanner,
  ErrorState,
  TableSkeleton,
} from '@/components/employee/AsyncState';
import { DEMO_MODE } from '@/lib/config';
import { formatKes, sumMinorUnits } from '@/lib/money';
import { formatDate, formatMonth, toCsv } from '@/lib/format';
import { demoPaymentRequests, demoProjects } from '@/data/demo-employee-data';
import type { PaymentRequest, Project } from '@/types/domain';

const APPROVED_STATUSES = new Set(['APPROVED', 'PROCESSING', 'PAID']);
const PENDING_STATUSES = new Set(['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL']);

interface ProjectRow {
  key: string;
  name: string;
  totalRequests: number;
  approved: bigint;
  pending: bigint;
  status: string;
}

interface MonthRow {
  key: string;
  label: string;
  requests: number;
  amount: bigint;
}

export default function EmployeeReportsPage() {
  const resource = useApiResource<{
    requests: PaymentRequest[];
    projects: Project[];
  }>('employee-reports', () =>
    DEMO_MODE
      ? Promise.resolve({ requests: demoPaymentRequests, projects: demoProjects })
      : Promise.all([listPaymentRequests(), listProjects()]).then(([requests, projects]) => ({
          requests,
          projects,
        })),
  );

  const requests = useMemo(() => resource.data?.requests ?? [], [resource.data]);
  const projects = useMemo(() => resource.data?.projects ?? [], [resource.data]);

  const projectIndex = useMemo(() => {
    const index = new Map<string, Project>();
    projects.forEach((project) => index.set(project.id, project));
    return index;
  }, [projects]);

  const totals = useMemo(() => {
    const approved = sumMinorUnits(
      requests
        .filter((request) => APPROVED_STATUSES.has(request.status))
        .map((request) => request.amount),
    );
    const pending = sumMinorUnits(
      requests
        .filter((request) => PENDING_STATUSES.has(request.status))
        .map((request) => request.amount),
    );
    return { approved, pending };
  }, [requests]);

  const projectRows = useMemo<ProjectRow[]>(() => {
    const groups = new Map<string, ProjectRow>();

    requests.forEach((request) => {
      const key = request.project_id ?? 'unassigned';
      const project = request.project_id ? projectIndex.get(request.project_id) : undefined;
      const row = groups.get(key) ?? {
        key,
        name: project?.name ?? request.project_name ?? 'Unassigned',
        totalRequests: 0,
        approved: BigInt(0),
        pending: BigInt(0),
        status: project ? (project.is_active ? 'Active' : 'Completed') : 'Active',
      };

      row.totalRequests += 1;
      if (APPROVED_STATUSES.has(request.status)) {
        row.approved += sumMinorUnits([request.amount]);
      }
      if (PENDING_STATUSES.has(request.status)) {
        row.pending += sumMinorUnits([request.amount]);
      }
      groups.set(key, row);
    });

    return Array.from(groups.values()).sort((left, right) => right.totalRequests - left.totalRequests);
  }, [requests, projectIndex]);

  const monthRows = useMemo<MonthRow[]>(() => {
    const groups = new Map<string, MonthRow>();

    requests.forEach((request) => {
      const date = new Date(request.created_at);
      const key = Number.isNaN(date.getTime())
        ? 'unknown'
        : `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const row = groups.get(key) ?? {
        key,
        label: formatMonth(request.created_at),
        requests: 0,
        amount: BigInt(0),
      };
      row.requests += 1;
      row.amount += sumMinorUnits([request.amount]);
      groups.set(key, row);
    });

    return Array.from(groups.values()).sort((left, right) => left.key.localeCompare(right.key));
  }, [requests]);

  const handleExport = () => {
    const csv = toCsv(
      [
        'Request ID',
        'Vendor',
        'Project',
        'Invoice Ref',
        'Amount (KES)',
        'Status',
        'Created',
        'Rejection reason',
      ],
      requests.map((request) => [
        request.id,
        request.vendor_name ?? '',
        request.project_name ?? '',
        request.invoice_number,
        request.amount,
        request.status,
        formatDate(request.created_at),
        request.rejection_reason,
      ]),
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'paywise-employee-requests.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const showError = Boolean(resource.error) && !resource.data;

  return (
    <div className="space-y-6">
      <DemoDataBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense &amp; Request Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Summary analytics of your site expenses, project allocations, and disbursement history.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={requests.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 text-gray-500" />
          <span>Export Summary (CSV)</span>
        </button>
      </div>

      {resource.loading && !showError ? (
        <TableSkeleton rows={4} columns={4} />
      ) : showError ? (
        <ErrorState
          error={resource.error!}
          onRetry={resource.reload}
          context="We could not build your report."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Approved Disbursed
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatKes(totals.approved)}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <Banknote className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pending Review
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {formatKes(totals.pending)}
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects With Requests
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {projectRows.length} {projectRows.length === 1 ? 'Site' : 'Sites'}
                </p>
              </div>
              <div className="p-3 bg-slate-100 text-slate-800 rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Project Expense Allocation</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Breakdown of approved and pending request amounts across ImaraWorks project sites.
              </p>
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
                  {projectRows.length > 0 ? (
                    projectRows.map((item) => (
                      <tr key={item.key} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-semibold text-gray-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-800" />
                          <span>{item.name}</span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{item.totalRequests}</td>
                        <td className="py-4 px-6 font-semibold text-emerald-600">
                          {formatKes(item.approved)}
                        </td>
                        <td className="py-4 px-6 font-medium text-amber-600">
                          {formatKes(item.pending)}
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No request data to summarise yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Submission Trends</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Historical overview of request volume and total requested value per month.
              </p>
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
                  {monthRows.length > 0 ? (
                    monthRows.map((trend) => (
                      <tr key={trend.key} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-900">{trend.label}</td>
                        <td className="py-4 px-6 text-gray-600">{trend.requests} requests</td>
                        <td className="py-4 px-6 font-semibold text-gray-900">
                          {formatKes(trend.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-gray-500">
                        No submissions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
