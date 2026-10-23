'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { MOCK_VENDORS } from '@/data/mock-manager-data';
import { PaymentMethod } from '@/types/manager';
import { VendorInvoicingSection } from './VendorInvoicingSection';
import { AmountRoutingSection } from './AmountRoutingSection';
import { ProjectSettlementSection } from './ProjectSettlementSection';
import { PurposeRemarksSection } from './PurposeRemarksSection';

export interface NewRequestFormProps {
  basePath?: string;
  backHref?: string;
  redirectHref?: string;
  title?: string;
  subtitle?: string;
}

export function NewRequestForm({
  basePath = '/manager',
  backHref,
  redirectHref,
  title = 'Create New Payment Request',
  subtitle = 'Submit vendor requisition for managerial review and financial processing.',
}: NewRequestFormProps) {
  const router = useRouter();
  const effectiveBackHref = backHref || `${basePath}/requests`;
  const effectiveRedirectHref = redirectHref || `${basePath}/requests`;

  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [project, setProject] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MPESA');
  const [requestedDate, setRequestedDate] = useState('2026-10-15');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const numericAmount = parseFloat(amount) || 0;

  const handleVendorChange = (id: string) => {
    setVendorId(id);
    const v = MOCK_VENDORS.find((item) => item.id === id);
    if (v) {
      setPaymentMethod(v.payoutMethod);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!vendorId) errs.vendorId = 'Please select a vendor.';
    if (!invoiceNumber.trim()) errs.invoiceNumber = 'Invoice number is required.';
    if (!amount || numericAmount <= 0) errs.amount = 'Please enter a valid positive amount.';
    if (!project) errs.project = 'Please select a project site.';
    if (!requestedDate) errs.requestedDate = 'Please choose a requested payment date.';
    if (!reason.trim()) errs.reason = 'Please describe the purpose of this payment.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmittedSuccess(true);
    setTimeout(() => {
      router.push(effectiveRedirectHref);
    }, 1500);
  };

  return (
    <div className="max-w-4xl space-y-6 font-serif mx-auto pb-12">
      {/* Breadcrumb / Back Navigation */}
      <div>
        <Link
          href={effectiveBackHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-ink hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Payment Requests</span>
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-ink">{subtitle}</p>
      </div>

      {/* Success Banner */}
      {submittedSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-ok/30 bg-ok-light p-4 text-ok shadow-sm">
          <CheckCircle2 className="size-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Payment Request Submitted Successfully!</p>
            <p className="text-xs text-ok/80">
              Reference code generated. Redirecting to payment requests queue…
            </p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-xs space-y-6"
      >
        <VendorInvoicingSection
          vendorId={vendorId}
          invoiceNumber={invoiceNumber}
          errors={errors}
          onVendorChange={handleVendorChange}
          onInvoiceNumberChange={setInvoiceNumber}
        />

        <AmountRoutingSection
          amount={amount}
          error={errors.amount}
          onAmountChange={setAmount}
        />

        <ProjectSettlementSection
          project={project}
          paymentMethod={paymentMethod}
          requestedDate={requestedDate}
          errors={errors}
          onProjectChange={setProject}
          onPaymentMethodChange={setPaymentMethod}
          onRequestedDateChange={setRequestedDate}
        />

        <PurposeRemarksSection
          reason={reason}
          notes={notes}
          error={errors.reason}
          onReasonChange={setReason}
          onNotesChange={setNotes}
        />

        {/* Footer Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end border-t border-line pt-6">
          <Link
            href={effectiveBackHref}
            className="rounded-md border border-line bg-surface px-5 py-2 text-sm font-semibold text-ink hover:bg-canvas text-center cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submittedSuccess}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            <span>Submit Payment Request</span>
          </button>
        </div>
      </form>
    </div>
  );
}
