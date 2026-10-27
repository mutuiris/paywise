'use client';

import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { MOCK_VENDORS } from '@/data/mock-manager-data';
import { VendorItem } from '@/types/manager';

interface VendorInvoicingSectionProps {
  vendorId: string;
  invoiceNumber: string;
  errors: Record<string, string>;
  vendors?: VendorItem[];
  onVendorChange: (id: string) => void;
  onInvoiceNumberChange: (val: string) => void;
}

export function VendorInvoicingSection({
  vendorId,
  invoiceNumber,
  errors,
  vendors = MOCK_VENDORS,
  onVendorChange,
  onInvoiceNumberChange,
}: VendorInvoicingSectionProps) {
  const selectedVendor = vendors.find((v) => v.id === vendorId);

  return (
    <div>
      <h2 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-line pb-2 flex items-center gap-2">
        <Building2 className="size-4 text-brand" />
        <span>1. Vendor & Invoicing</span>
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Vendor Select */}
        <div>
          <label htmlFor="vendor-select" className="block text-xs font-semibold text-ink">
            Vendor / Payee <span className="text-err">*</span>
          </label>
          <div className="relative mt-1.5">
            <select
              id="vendor-select"
              value={vendorId}
              onChange={(e) => onVendorChange(e.target.value)}
              className={`w-full appearance-none rounded-md border bg-surface pl-3 pr-8 py-2 text-sm text-ink focus:outline-none focus:ring-2 font-serif cursor-pointer ${
                errors.vendorId
                  ? 'border-err focus:border-err focus:ring-err/20'
                  : 'border-line focus:border-brand focus:ring-brand/20'
              }`}
            >
              <option value="">-- Choose registered vendor --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.service})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
          </div>
          {errors.vendorId && (
            <p className="mt-1 text-xs text-err font-medium">{errors.vendorId}</p>
          )}

          {selectedVendor && (
            <div className="mt-2 rounded-lg bg-surface-subtle border border-line p-2.5 text-xs text-muted-ink space-y-0.5">
              <p className="font-semibold text-ink">
                {selectedVendor.contactName} · {selectedVendor.contactPhone}
              </p>
              <p>{selectedVendor.contactEmail}</p>
              <p className="font-serif text-[11px] text-brand">
                {selectedVendor.payoutMethod === 'MPESA'
                  ? `M-Pesa: ${
                      selectedVendor.tillNumber
                        ? `Till ${selectedVendor.tillNumber}`
                        : `Paybill ${selectedVendor.paybillNumber}`
                    }`
                  : `${selectedVendor.bankName}: A/C ${selectedVendor.accountNumber}`}
              </p>
            </div>
          )}
        </div>

        {/* Invoice Number */}
        <div>
          <label htmlFor="invoice-number" className="block text-xs font-semibold text-ink">
            Invoice / Bill Reference Number <span className="text-err">*</span>
          </label>
          <input
            id="invoice-number"
            type="text"
            placeholder="e.g. INV-2026-882"
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
            className={`mt-1.5 w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-ink font-serif focus:outline-none focus:ring-2 ${
              errors.invoiceNumber
                ? 'border-err focus:border-err focus:ring-err/20'
                : 'border-line focus:border-brand focus:ring-brand/20'
            }`}
          />
          {errors.invoiceNumber && (
            <p className="mt-1 text-xs text-err font-medium">{errors.invoiceNumber}</p>
          )}
          <p className="mt-1 text-[11px] text-muted-ink font-serif">
            Must match the reference printed on the vendor invoice.
          </p>
        </div>
      </div>
    </div>
  );
}
