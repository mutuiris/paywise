'use client';

import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, SearchX, Building2 } from 'lucide-react';
import type { Vendor } from '@/types/manager';
import { INITIAL_PAYMENT_REQUESTS, formatCurrency } from '@/data/mock-manager-data';
import { MOCK_VENDORS } from '@/data/mock-vendor-data';

interface VendorRow extends Vendor {
  requestCount: number;
  openRequestCount: number;
  totalSpend: number;
}

const OPEN_STATUSES = new Set(['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED']);

function matchesQuery(vendor: VendorRow, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    vendor.name.toLowerCase().includes(q) ||
    vendor.category.toLowerCase().includes(q) ||
    vendor.contactName.toLowerCase().includes(q) ||
    vendor.email.toLowerCase().includes(q)
  );
}

function buildVendorRows(): VendorRow[] {
  return MOCK_VENDORS.map((vendor) => {
    const vendorRequests = INITIAL_PAYMENT_REQUESTS.filter(
      (req) => req.vendorId === vendor.id
    );
    return {
      ...vendor,
      requestCount: vendorRequests.length,
      openRequestCount: vendorRequests.filter((req) =>
        OPEN_STATUSES.has(req.status)
      ).length,
      totalSpend: vendorRequests
        .filter((req) => req.status !== 'REJECTED')
        .reduce((sum, req) => sum + req.amount, 0),
    };
  });
}

export function VendorsView() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams.get('q') ?? '';

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

  const rows = useMemo(() => buildVendorRows(), []);

  const filteredVendors = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return rows.filter((vendor) => matchesQuery(vendor, trimmed));
  }, [rows, query]);

  const stats = useMemo(() => {
    const active = rows.filter((v) => v.status === 'ACTIVE').length;
    const categories = new Set(rows.map((v) => v.category)).size;
    const openRequests = rows.reduce((sum, v) => sum + v.openRequestCount, 0);
    return { active, categories, openRequests };
  }, [rows]);

  const summaryCards = [
    { label: 'Total Vendors', value: String(rows.length), hint: 'On file' },
    { label: 'Active Vendors', value: String(stats.active), hint: 'Contracted' },
    { label: 'Categories', value: String(stats.categories), hint: 'Supply lines' },
    { label: 'Open Requests', value: String(stats.openRequests), hint: 'Awaiting action' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page header */}
      <div className="border-b border-line pb-4">
        <h1 className="text-2xl font-bold text-ink">Vendors</h1>
        <p className="mt-1 text-sm text-muted-ink">
          Vendor directory with spend history and open payment requests.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-line bg-surface p-5 shadow-xs"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-ink">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-ink">{card.value}</p>
            <p className="mt-1 text-xs text-subtle-ink">{card.hint}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <label htmlFor="vendors-search" className="sr-only">
          Search vendors
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-ink"
        />
        <input
          id="vendors-search"
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search name, category, contact…"
          className="w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-muted-ink/70 transition-all focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <p className="text-xs text-muted-ink" role="status">
        Showing {filteredVendors.length} of {rows.length} vendors
      </p>

      {/* Empty state */}
      {filteredVendors.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface p-12 text-center shadow-xs">
          <SearchX
            className="mx-auto size-10 text-subtle-ink"
            aria-hidden="true"
          />
          <h3 className="mt-3 text-sm font-semibold text-ink">
            No vendors found
          </h3>
          <p className="mt-1 text-sm text-muted-ink">
            Nothing matches &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => handleQueryChange('')}
            className="mt-4 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-canvas"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface-subtle text-xs font-semibold uppercase tracking-wide text-muted-ink">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Vendor
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Contact
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Payment Method
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Requests
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Total Spend
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="transition-colors hover:bg-surface-subtle"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-deep">
                          <Building2 className="size-4" aria-hidden="true" />
                        </span>
                        <div>
                          <div className="font-medium text-ink">
                            {vendor.name}
                          </div>
                          <div className="text-xs text-muted-ink">
                            Onboarded {vendor.onboardingDate.slice(0, 10)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {vendor.category}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-ink-secondary">
                        {vendor.contactName}
                      </div>
                      <div className="text-xs text-muted-ink">
                        {vendor.email} · {vendor.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center whitespace-nowrap rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary">
                        {vendor.paymentMethod === 'MPESA'
                          ? 'M-Pesa'
                          : 'Bank transfer'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {vendor.requestCount}
                      {vendor.openRequestCount > 0 ? (
                        <span className="ml-1.5 inline-flex items-center rounded-full border border-warn/30 bg-warn/10 px-1.5 py-0.5 text-[10px] font-medium text-warn">
                          {vendor.openRequestCount} open
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                      {formatCurrency(vendor.totalSpend)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                          vendor.status === 'ACTIVE'
                            ? 'border-ok/30 bg-ok/10 text-ok'
                            : 'border-line bg-canvas text-muted-ink'
                        }`}
                      >
                        {vendor.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
