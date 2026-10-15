'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Eye,
  Plus,
  FileText,
  CheckCircle2,
  User,
} from 'lucide-react';
import {
  MOCK_VENDORS,
  INITIAL_PAYMENT_REQUESTS,
  formatCurrency,
  formatDate,
} from '@/data/mock-manager-data';
import { StatusBadge } from '../common/StatusBadge';
import { SummaryCard } from '../dashboard/SummaryCard';

interface VendorDetailProps {
  vendorId: string;
}

export function VendorDetail({ vendorId }: VendorDetailProps) {
  const vendor = MOCK_VENDORS.find((v) => v.id === vendorId) || MOCK_VENDORS[0];
  const vendorRequests = INITIAL_PAYMENT_REQUESTS.filter((r) => r.vendorId === vendor.id);

  const totalPaid = vendorRequests
    .filter((r) => r.status === 'PAID')
    .reduce((acc, r) => acc + r.amount, 0);

  const pendingRequests = vendorRequests.filter((r) =>
    ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING'].includes(r.status)
  );

  return (
    <div className="space-y-6 font-serif max-w-6xl mx-auto pb-12">
      {/* Breadcrumb & Top Page Header */}
      <div>
        <Link
          href="/manager/vendors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-ink hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Vendors</span>
        </Link>

        {/* Vendor Header Row */}
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {vendor.name}
              </h1>
              {vendor.isActive ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ok/10 text-ok px-2.5 py-0.5 text-xs font-medium border border-ok/30">
                  <span className="size-1.5 rounded-full bg-ok" />
                  <span>Active</span>
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-muted-ink px-2.5 py-0.5 text-xs font-medium border border-line">
                  <span>Inactive</span>
                </span>
              )}
            </div>
            <p className="text-sm text-muted-ink mt-1 flex items-center gap-2">
              <Building2 className="size-4 text-brand shrink-0" />
              <span>{vendor.service}</span>
            </p>
          </div>

          <Link
            href="/manager/requests/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>New Payment to Vendor</span>
          </Link>
        </div>
      </div>

      {/* 1. Stat Cards (Start First) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Disbursed"
          value={formatCurrency(totalPaid)}
          tone="ok"
          hint="Completed payouts"
        />
        <SummaryCard
          label="Outstanding Requests"
          value={pendingRequests.length}
          tone="warn"
          hint="Pending approval/processing"
        />
        <SummaryCard
          label="All-Time Requisitions"
          value={vendorRequests.length}
          tone="neutral"
          hint="Total historical records"
        />
      </div>

      {/* 2. Contact Info & Settlement Account Section */}
      <section className="rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-xs space-y-4">
        <div className="border-b border-line pb-3">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
            <Building2 className="size-4 text-brand" />
            <span>Vendor Profile</span>
          </h2>
          <p className="text-xs text-muted-ink mt-0.5">
            Verified contact person and payout disbursement details for {vendor.name}
          </p>
        </div>

        {/* 2-Column Clean Info: Contact Information + Settlement Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Contact Details */}
          <div className="rounded-xl border border-line bg-surface-subtle p-4 space-y-3">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 text-muted-ink border-b border-line pb-2">
              <User className="size-3.5 text-brand" />
              <span>Contact Person & Info</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                <span className="text-xs text-muted-ink">Contact Person</span>
                <span className="font-semibold text-ink sm:text-right">{vendor.contactName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                <span className="text-xs text-muted-ink">Email Address</span>
                <span className="font-medium text-ink flex items-center gap-1.5 break-all sm:text-right">
                  <Mail className="size-3.5 text-muted-ink shrink-0" />
                  <span>{vendor.contactEmail}</span>
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                <span className="text-xs text-muted-ink">Phone Number</span>
                <span className="font-medium text-ink flex items-center gap-1.5 sm:text-right">
                  <Phone className="size-3.5 text-muted-ink shrink-0" />
                  <span>{vendor.contactPhone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Settlement Account Details */}
          <div className="rounded-xl border border-line bg-surface-subtle p-4 space-y-3">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 text-muted-ink border-b border-line pb-2">
              <CreditCard className="size-3.5 text-brand" />
              <span>Settlement Account Details</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                <span className="text-xs text-muted-ink">Payout</span>
                <span className="font-semibold text-ink sm:text-right">
                  {vendor.payoutMethod === 'MPESA' ? 'M-Pesa' : 'Bank'}
                </span>
              </div>

              {vendor.payoutMethod === 'MPESA' ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                    <span className="text-xs text-muted-ink">
                      {vendor.tillNumber ? 'Till Number' : 'Paybill Number'}
                    </span>
                    <span className="font-serif font-bold text-brand text-sm sm:text-right">
                      {vendor.tillNumber ? `Till ${vendor.tillNumber}` : `Paybill ${vendor.paybillNumber}`}
                    </span>
                  </div>
                  {vendor.accountNumber && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                      <span className="text-xs text-muted-ink">Account Reference</span>
                      <span className="font-serif font-medium text-ink sm:text-right">{vendor.accountNumber}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                    <span className="text-xs text-muted-ink">Bank Name</span>
                    <span className="font-semibold text-ink sm:text-right">{vendor.bankName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                    <span className="text-xs text-muted-ink">Account Number</span>
                    <span className="font-serif font-bold text-brand sm:text-right">{vendor.accountNumber}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Full-Width Historical Payment Requests Section */}
      <section className="rounded-2xl border border-line bg-surface overflow-hidden shadow-xs">
        <div className="border-b border-line px-5 py-4 bg-surface-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <FileText className="size-4 text-brand" />
              <span>Payment Request History</span>
            </h2>
            <p className="text-xs text-muted-ink mt-0.5">
              All historical requisitions and payouts submitted for {vendor.name}
            </p>
          </div>
          <span className="text-xs font-medium text-muted-ink">
            {vendorRequests.length} {vendorRequests.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {vendorRequests.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto size-8 text-muted-ink/40" />
            <p className="mt-2 text-sm font-semibold text-ink">
              No payment requests submitted yet
            </p>
            <p className="mt-1 text-xs text-muted-ink">
              Payments submitted for this vendor will automatically appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas text-[11px] font-semibold text-muted-ink uppercase tracking-wider">
                    <th scope="col" className="px-5 py-3">Reference</th>
                    <th scope="col" className="px-5 py-3 text-right">Amount</th>
                    <th scope="col" className="px-5 py-3">Project</th>
                    <th scope="col" className="px-5 py-3">Date</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {vendorRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Link
                          href={`/manager/requests/${req.id}`}
                          className="font-serif text-[13px] font-semibold text-brand group-hover:underline block"
                        >
                          {req.reference}
                        </Link>
                        <span className="font-serif text-[11px] text-muted-ink block">
                          {req.invoiceNumber}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-serif font-semibold tabular-nums text-ink">
                        {formatCurrency(req.amount)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                        {req.project}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-ink">
                        {formatDate(req.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <Link
                          href={`/manager/requests/${req.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas hover:border-brand/40 shadow-2xs"
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
            <ul className="divide-y divide-line lg:hidden">
              {vendorRequests.map((req) => (
                <li key={req.id}>
                  <Link
                    href={`/manager/requests/${req.id}`}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/90 active:bg-slate-100 block transition-colors"
                  >
                    <div>
                      <span className="font-serif text-[13px] font-semibold text-brand block">
                        {req.reference}
                      </span>
                      <p className="text-xs text-muted-ink mt-0.5">
                        {req.project} · {req.invoiceNumber}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <StatusBadge status={req.status} />
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
