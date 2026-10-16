'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { PaymentRequestItem } from '@/types/manager';
import {
  MOCK_VENDORS,
  MOCK_PROJECTS,
  INITIAL_PAYMENT_REQUESTS,
  formatCurrency,
  formatDate,
} from '@/data/mock-manager-data';
import { StatusBadge } from '../common/StatusBadge';

export interface RequestsListProps {
  basePath?: string;
}

export function RequestsList({ basePath = '/manager' }: RequestsListProps = {}) {
  const [requests] = useState<PaymentRequestItem[]>(INITIAL_PAYMENT_REQUESTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtering
  const filtered = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (vendorFilter !== 'ALL' && r.vendorId !== vendorFilter) return false;
    if (projectFilter !== 'ALL' && r.project !== projectFilter) return false;
    if (methodFilter !== 'ALL' && r.paymentMethod !== methodFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.reference.toLowerCase().includes(q) ||
        r.vendorName.toLowerCase().includes(q) ||
        r.invoiceNumber.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedRequests = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setVendorFilter('ALL');
    setProjectFilter('ALL');
    setMethodFilter('ALL');
    setCurrentPage(1);
  };

  const totalFilteredAmount = filtered.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Payment Requests
          </h1>
          <p className="mt-1 text-sm text-muted-ink">
            Track, filter, and review all vendor payment requisitions across project sites.
          </p>
        </div>

        {basePath !== '/finance' && basePath !== '/admin' && (
          <Link
            href={`${basePath}/requests/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>New Payment Request</span>
          </Link>
        )}
      </div>

      {/* Filter Bar Card */}
      <div className="rounded-xl border border-line bg-surface p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
            <input
              type="text"
              placeholder="Search reference, vendor, invoice, reason…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-line bg-canvas/60 py-2 pl-9 pr-3 text-xs sm:text-sm text-ink placeholder:text-muted-ink focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-serif"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="sr-only">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 font-serif"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
              <option value="PROCESSING">Processing</option>
              <option value="SUBMITTED">Submitted</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label htmlFor="project-filter" className="sr-only">Project</label>
            <select
              id="project-filter"
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 font-serif"
            >
              <option value="ALL">All Projects</option>
              {MOCK_PROJECTS.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Filter */}
          <div>
            <label htmlFor="vendor-filter" className="sr-only">Vendor</label>
            <select
              id="vendor-filter"
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-xs sm:text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 font-serif"
            >
              <option value="ALL">All Vendors</option>
              {MOCK_VENDORS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-3 text-xs text-muted-ink">
          <div className="flex items-center gap-3">
            <span>
              Requests: <strong className="text-ink">{filtered.length}</strong>
            </span>
            <span>·</span>
            <span>
              Total Value: <strong className="text-ink font-serif">{formatCurrency(totalFilteredAmount)}</strong>
            </span>
          </div>

          {(search || statusFilter !== 'ALL' || vendorFilter !== 'ALL' || projectFilter !== 'ALL' || methodFilter !== 'ALL') && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-brand font-semibold hover:underline cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <section className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs">
        {paginatedRequests.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto size-10 text-muted-ink/40" />
            <h3 className="mt-3 text-sm font-semibold text-ink">
              No matching payment requests
            </h3>
            <p className="mt-1 text-xs text-muted-ink">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas text-[11px] font-semibold text-muted-ink uppercase tracking-wider">
                    <th scope="col" className="px-5 py-3">Request ID</th>
                    <th scope="col" className="px-5 py-3">Vendor</th>
                    <th scope="col" className="px-5 py-3 text-right">Amount</th>
                    <th scope="col" className="px-5 py-3">Project</th>
                    <th scope="col" className="px-5 py-3">Requester</th>
                    <th scope="col" className="px-5 py-3">Method</th>
                    <th scope="col" className="px-5 py-3">Date</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {paginatedRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      {/* ID */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Link
                          href={`${basePath}/requests/${req.id}`}
                          className="font-serif text-[13px] font-semibold text-brand group-hover:underline"
                        >
                          {req.reference}
                        </Link>
                        <span className="block font-serif text-[11px] text-muted-ink">
                          {req.invoiceNumber}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="font-semibold text-ink block">
                          {req.vendorName}
                        </span>
                        <span className="text-[11px] text-muted-ink truncate max-w-[180px] block">
                          {req.reason}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">
                        {formatCurrency(req.amount)}
                      </td>

                      {/* Project */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                        {req.project}
                      </td>

                      {/* Requester */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink font-medium">
                        {req.requesterName}
                      </td>

                      {/* Method */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                        {req.paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank'}
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                        {formatDate(req.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>

                      {/* Action Link */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <Link
                          href={`${basePath}/requests/${req.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas hover:border-brand/40 cursor-pointer transition-all shadow-2xs"
                        >
                          <Eye className="size-3.5 text-muted-ink" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <ul className="divide-y divide-line lg:hidden" aria-label="Payment requests">
              {paginatedRequests.map((req) => (
                <li key={req.id}>
                  <Link
                    href={`${basePath}/requests/${req.id}`}
                    className="group flex items-center justify-between p-4 hover:bg-slate-50/90 active:bg-slate-100 transition-colors block"
                  >
                    <div className="min-w-0 pr-3">
                      <span className="font-serif text-[13px] font-semibold text-brand group-hover:text-brand-deep group-hover:underline block transition-colors">
                        {req.reference}
                      </span>
                      <p className="mt-0.5 font-semibold text-ink text-sm truncate group-hover:text-brand-deep transition-colors">
                        {req.vendorName}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Eye className="size-4 text-muted-ink group-hover:text-brand group-hover:scale-110 transition-all" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-line px-5 py-3 bg-surface-subtle text-xs">
                <span className="text-muted-ink">
                  Page <strong className="text-ink">{currentPage}</strong> of <strong className="text-ink">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
