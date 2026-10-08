'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Building2,
  Eye,
} from 'lucide-react';
import {
  MOCK_VENDORS,
  INITIAL_PAYMENT_REQUESTS,
  formatCurrency,
} from '@/data/mock-manager-data';
import { SummaryCard } from '../dashboard/SummaryCard';

export function VendorsList() {
  const [search, setSearch] = useState('');

  // Calculate dynamic stats for each vendor
  const vendorStats = MOCK_VENDORS.map((v) => {
    const vendorRequests = INITIAL_PAYMENT_REQUESTS.filter((r) => r.vendorId === v.id);
    const totalPaid = vendorRequests
      .filter((r) => r.status === 'PAID')
      .reduce((acc, r) => acc + r.amount, 0);
    const pendingCount = vendorRequests.filter((r) =>
      ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING'].includes(r.status)
    ).length;

    return {
      ...v,
      requestCount: vendorRequests.length,
      pendingCount,
      totalPaid,
    };
  });

  const filteredVendors = vendorStats.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.service.toLowerCase().includes(q) ||
      v.contactName.toLowerCase().includes(q) ||
      v.contactEmail.toLowerCase().includes(q) ||
      (v.bankName && v.bankName.toLowerCase().includes(q))
    );
  });

  const totalCumulativePaid = vendorStats.reduce((acc, v) => acc + v.totalPaid, 0);

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Registered Vendors
          </h1>
          <p className="mt-1 text-sm text-muted-ink">
            Approved suppliers and service contractors paid through PayWise.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Total Registered"
          value={MOCK_VENDORS.length}
          tone="neutral"
          hint="All onboarded suppliers"
        />
        <SummaryCard
          label="Total Active"
          value={MOCK_VENDORS.filter((v) => v.isActive).length}
          tone="brand"
          hint="Operational & approved"
        />
        <SummaryCard
          label="Total Disbursed"
          value={formatCurrency(totalCumulativePaid)}
          tone="ok"
          hint="Completed settlements"
        />
        <SummaryCard
          label="Total Requisitions"
          value={INITIAL_PAYMENT_REQUESTS.length}
          tone="warn"
          hint="Across all vendors"
        />
      </div>

      {/* Vendors Table Card */}
      <section className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs">
        {/* Search Bar Header */}
        <div className="border-b border-line p-4 bg-surface">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
            <input
              type="text"
              placeholder="Search vendors by name, service, contact person…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-line bg-canvas/60 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted-ink focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-serif"
            />
          </div>
        </div>
        {filteredVendors.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="mx-auto size-10 text-muted-ink/40" />
            <h3 className="mt-3 text-sm font-semibold text-ink">No vendors found</h3>
            <p className="mt-1 text-xs text-muted-ink">
              Try adjusting your search keywords.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas text-[11px] font-semibold text-muted-ink uppercase tracking-wider">
                    <th scope="col" className="px-5 py-3">Vendor</th>
                    <th scope="col" className="px-5 py-3">Category / Service</th>
                    <th scope="col" className="px-5 py-3">Settlement Channel</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-center">Total Reqs</th>
                    <th scope="col" className="px-5 py-3 text-center">Pending</th>
                    <th scope="col" className="px-5 py-3 text-right">Total Paid</th>
                    <th scope="col" className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredVendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      {/* Vendor Name & Contact */}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Link
                          href={`/manager/vendors/${vendor.id}`}
                          className="font-semibold text-ink group-hover:text-brand transition-colors block"
                        >
                          {vendor.name}
                        </Link>
                        <span className="text-xs text-muted-ink block">
                          {vendor.contactName} · {vendor.contactPhone}
                        </span>
                      </td>

                      {/* Service */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink font-medium">
                        {vendor.service}
                      </td>

                      {/* Settlement Channel */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink font-serif">
                        {vendor.payoutMethod === 'MPESA' ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                            <span className="size-1.5 rounded-full bg-emerald-600" />
                            <span>M-Pesa {vendor.tillNumber ? `Till ${vendor.tillNumber}` : `Paybill ${vendor.paybillNumber}`}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-brand font-medium">
                            <span className="size-1.5 rounded-full bg-brand" />
                            <span>{vendor.bankName}</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs">
                        {vendor.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/10 text-ok px-2.5 py-0.5 text-[11px] font-medium border border-ok/30">
                            <span className="size-1.5 rounded-full bg-ok" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-muted-ink px-2.5 py-0.5 text-[11px] font-medium border border-line">
                            <span className="size-1.5 rounded-full bg-muted-ink" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Total Reqs */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-center font-serif font-medium text-ink text-xs">
                        {vendor.requestCount}
                      </td>

                      {/* Pending */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-center font-serif font-semibold text-warn text-xs">
                        {vendor.pendingCount > 0 ? vendor.pendingCount : '—'}
                      </td>

                      {/* Total Paid */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">
                        {vendor.totalPaid > 0 ? formatCurrency(vendor.totalPaid) : '—'}
                      </td>

                      {/* Action */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <Link
                          href={`/manager/vendors/${vendor.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas hover:border-brand/40 cursor-pointer transition-all shadow-2xs"
                        >
                          <Eye className="size-3.5 text-muted-ink" />
                          <span>Profile</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <ul className="divide-y divide-line lg:hidden" aria-label="Vendors list">
              {filteredVendors.map((vendor) => (
                <li key={vendor.id}>
                  <Link
                    href={`/manager/vendors/${vendor.id}`}
                    className="group flex items-center justify-between p-4 hover:bg-slate-50/90 active:bg-slate-100 transition-colors block"
                  >
                    <div className="min-w-0 pr-3">
                      <span className="font-semibold text-ink text-sm group-hover:text-brand transition-colors block">
                        {vendor.name}
                      </span>
                      <p className="text-xs text-muted-ink truncate mt-0.5">
                        {vendor.service}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Eye className="size-4 text-muted-ink group-hover:text-brand group-hover:scale-110 transition-all" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
