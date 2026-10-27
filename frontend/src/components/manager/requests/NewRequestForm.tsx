'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { MOCK_VENDORS, MOCK_PROJECTS } from '@/data/mock-manager-data';
import { PaymentMethod, VendorItem } from '@/types/manager';
import { vendorService, paymentService } from '@/lib/api/services';
import { apiClient } from '@/lib/api/client';
import { DEMO_MODE } from '@/lib/config';
import { toPaymentMethod } from '../common/mapPaymentRequest';
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

  const [vendors, setVendors] = useState<VendorItem[]>(DEMO_MODE ? MOCK_VENDORS : []);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>(
    DEMO_MODE ? MOCK_PROJECTS.map((name) => ({ id: name, name })) : []
  );
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [project, setProject] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MPESA');
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (DEMO_MODE) return;
    let ignore = false;
    Promise.allSettled([
      vendorService.listVendors(),
      vendorService.listProjects(),
    ]).then(([vendorsRes, projectsRes]) => {
      if (ignore) return;
      if (vendorsRes.status === 'fulfilled') {
        setVendors(
          vendorsRes.value.map((v) => ({
            id: v.id,
            name: v.name,
            service: v.service,
            contactName: v.contactName,
            contactEmail: v.contactEmail,
            contactPhone: v.contactPhone,
            payoutMethod: toPaymentMethod(v.payoutMethod),
            bankName: v.bankName,
            accountNumber: v.accountNumber,
            isActive: v.isActive,
            createdAt: v.createdAt,
          }))
        );
      } else {
        setServerError('Unable to load vendors. Check the backend is running.');
      }
      if (projectsRes.status === 'fulfilled') {
        setProjects(projectsRes.value.map((p) => ({ id: p.id, name: p.name })));
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const numericAmount = parseFloat(amount) || 0;

  const handleVendorChange = (id: string) => {
    setVendorId(id);
    const v = vendors.find((item) => item.id === id);
    if (v) {
      setPaymentMethod(v.payoutMethod);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!vendorId) errs.vendorId = 'Please select a vendor';
    if (!amount || numericAmount <= 0) errs.amount = 'Enter a valid amount';
    if (!invoiceNumber.trim()) errs.invoiceNumber = 'Invoice reference number is required';
    if (!project) errs.project = 'Please select a project site';
    if (!requestedDate) errs.requestedDate = 'Required payout date is mandatory';
    if (!reason.trim()) errs.reason = 'Requisition reason / description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    if (DEMO_MODE) {
      setServerError('Demo mode: requests are not saved.');
      setIsSubmitting(false);
      return;
    }

    let createdId: string | null = null;
    try {
      const created = await paymentService.createRequest({
        vendor_id: vendorId,
        project_id: project,
        amount: amount.trim(),
        currency: 'KES',
        invoice_number: invoiceNumber.trim(),
        description: reason.trim(),
        payment_method: paymentMethod,
        supporting_notes: notes.trim(),
      });
      createdId = created.id;
      // Creation yields a DRAFT; submitting puts it in the approval queue.
      await apiClient(`/api/payments/${createdId}/submit/`, { method: 'POST' });

      setSubmittedSuccess(true);
      setTimeout(() => {
        router.push(effectiveRedirectHref);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit payment request to backend.';
      setServerError(
        createdId ? `Saved as a draft, but submitting for approval failed: ${msg}` : msg
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-serif pb-12">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          href={effectiveBackHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-ink hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Requests</span>
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-ink">{subtitle}</p>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-4 text-xs text-red-900">
          <AlertCircle className="size-4 shrink-0 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      {submittedSuccess && (
        <div className="rounded-xl border border-ok/30 bg-ok/10 p-5 text-sm text-ok flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0" />
          <div>
            <p className="font-semibold">Requisition Submitted Successfully</p>
            <p className="text-xs text-ok/80 mt-0.5">
              Your payment request has been recorded and routed for clearance. Redirecting...
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-line bg-surface p-6 shadow-xs space-y-8"
      >
        <VendorInvoicingSection
          vendorId={vendorId}
          invoiceNumber={invoiceNumber}
          errors={errors}
          vendors={vendors}
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
          projects={projects}
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
            disabled={submittedSuccess || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Submitting to Server…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>Submit Payment Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
