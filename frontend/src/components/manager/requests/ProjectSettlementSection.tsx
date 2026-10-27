'use client';

import React from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { PaymentMethod } from '@/types/manager';

interface ProjectSettlementSectionProps {
  project: string;
  paymentMethod: PaymentMethod;
  requestedDate: string;
  errors: Record<string, string>;
  /** Option value is the project id. */
  projects?: { id: string; name: string }[];
  onProjectChange: (val: string) => void;
  onPaymentMethodChange: (val: PaymentMethod) => void;
  onRequestedDateChange: (val: string) => void;
}

export function ProjectSettlementSection({
  project,
  paymentMethod,
  requestedDate,
  errors,
  projects = [],
  onProjectChange,
  onPaymentMethodChange,
  onRequestedDateChange,
}: ProjectSettlementSectionProps) {
  return (
    <div>
      <h2 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-line pb-2 flex items-center gap-2">
        <FileText className="size-4 text-brand" />
        <span>3. Project Site & Settlement Method</span>
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Project */}
        <div>
          <label htmlFor="project-select" className="block text-xs font-semibold text-ink">
            Project Site / Department <span className="text-err">*</span>
          </label>
          <div className="relative mt-1.5">
            <select
              id="project-select"
              value={project}
              onChange={(e) => onProjectChange(e.target.value)}
              className={`w-full appearance-none rounded-md border bg-surface pl-3 pr-8 py-2 text-sm text-ink focus:outline-none focus:ring-2 font-serif cursor-pointer ${
                errors.project
                  ? 'border-err focus:border-err focus:ring-err/20'
                  : 'border-line focus:border-brand focus:ring-brand/20'
              }`}
            >
              <option value="">-- Choose project site --</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
          </div>
          {errors.project && (
            <p className="mt-1 text-xs text-err font-medium">{errors.project}</p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="method-select" className="block text-xs font-semibold text-ink">
            Disbursement Channel <span className="text-err">*</span>
          </label>
          <div className="relative mt-1.5">
            <select
              id="method-select"
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
              className="w-full appearance-none rounded-md border border-line bg-surface pl-3 pr-8 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 font-serif cursor-pointer"
            >
              <option value="MPESA">M-Pesa Payout</option>
              <option value="BANK_TRANSFER">Bank</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
          </div>
        </div>

        {/* Requested Date */}
        <div>
          <label htmlFor="date-input" className="block text-xs font-semibold text-ink">
            Requested Payout Date <span className="text-err">*</span>
          </label>
          <input
            id="date-input"
            type="date"
            value={requestedDate}
            onChange={(e) => onRequestedDateChange(e.target.value)}
            className={`mt-1.5 w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 font-serif ${
              errors.requestedDate
                ? 'border-err focus:border-err focus:ring-err/20'
                : 'border-line focus:border-brand focus:ring-brand/20'
            }`}
          />
          {errors.requestedDate && (
            <p className="mt-1 text-xs text-err font-medium">{errors.requestedDate}</p>
          )}
        </div>
      </div>
    </div>
  );
}
