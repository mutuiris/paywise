'use client';

import React from 'react';
import { Building2, User, Mail, Phone, CreditCard } from 'lucide-react';
import { VendorItem } from '@/types/manager';

interface VendorProfileCardProps {
  vendor: VendorItem;
}

export function VendorProfileCard({ vendor }: VendorProfileCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-xs space-y-4 font-serif">
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
  );
}
