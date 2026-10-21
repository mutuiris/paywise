'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Building2,
  Info,
  CreditCard,
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  MOCK_VENDORS,
  MOCK_PROJECTS,
  formatCurrency,
  getApprovalRoute,
} from '@/data/mock-manager-data';
import { PaymentMethod, VendorItem } from '@/types/manager';
import { vendorService, paymentService } from '@/lib/api/services';

export function NewRequestForm() {
  const router = useRouter();

  const [vendors, setVendors] = useState<VendorItem[]>(MOCK_VENDORS);
  const [projects, setProjects] = useState<string[]>(MOCK_PROJECTS);
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [project, setProject] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MPESA');
  const [requestedDate, setRequestedDate] = useState('2026-10-15');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      vendorService.listVendors(),
      vendorService.listProjects(),
    ]).then(([vendorsRes, projectsRes]) => {
      if (ignore) return;
      if (vendorsRes.status === 'fulfilled' && vendorsRes.value?.vendors?.length) {
        const mappedVendors: VendorItem[] = vendorsRes.value.vendors.map((v) => ({
          id: v.id,
          name: v.name,
          service: v.service_category || 'Contractor',
          contactName: v.name,
          contactEmail: v.email,
          contactPhone: v.phone_number,
          payoutMethod: v.payment_details?.payout_method === 'BANK' ? 'BANK_TRANSFER' : 'MPESA',
          bankName: v.payment_details?.bank_name,
          accountNumber: v.payment_details?.account_number || v.payment_details?.mpesa_number,
          isActive: v.is_active,
        }));
        setVendors(mappedVendors);
      }
      if (projectsRes.status === 'fulfilled' && projectsRes.value?.projects?.length) {
        setProjects(projectsRes.value.projects.map((p) => p.name));
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const selectedVendor = vendors.find((v) => v.id === vendorId);
  const numericAmount = parseFloat(amount) || 0;
  const route = getApprovalRoute(numericAmount);

  const handleVendorChange = (id: string) => {
    setVendorId(id);
    const v = vendors.find((item) => item.id === id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await paymentService.createRequest({
        vendor_id: vendorId,
        amount: numericAmount,
        currency: 'KES',
        invoice_number: invoiceNumber.trim(),
        description: reason.trim(),
        payment_method: paymentMethod === 'BANK_TRANSFER' ? 'BANK' : 'MPESA',
        supporting_notes: notes.trim() || undefined,
        project_name: project,
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        router.push('/manager/requests');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit payment request to server.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 font-serif mx-auto pb-12">
      {/* Breadcrumb / Back Navigation */}
      <div>
        <Link
          href="/manager/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-ink hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Payment Requests</span>
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Create New Payment Request
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Submit vendor requisition for managerial review and financial processing.
        </p>
      </div>

      {/* Success Banner */}
      {submittedSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-ok/30 bg-ok-light p-4 text-ok shadow-sm animate-in fade-in">
          <CheckCircle2 className="size-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Payment Request Submitted Successfully!</p>
            <p className="text-xs text-ok/80">
              Reference code generated. Redirecting to payment requests queue…
            </p>
          </div>
        </div>
      )}

      {/* Server Error Banner */}
      {serverError && (
        <div className="flex items-center gap-3 rounded-xl border border-err/30 bg-err-light p-4 text-err shadow-sm animate-in fade-in">
          <AlertCircle className="size-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Submission Error</p>
            <p className="text-xs text-err/90">{serverError}</p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-xs space-y-6"
      >
        {/* Section 1: Vendor & Invoicing */}
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
              <select
                id="vendor-select"
                value={vendorId}
                onChange={(e) => handleVendorChange(e.target.value)}
                className={`mt-1.5 w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 font-serif ${
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
              {errors.vendorId && (
                <p className="mt-1 text-xs text-err font-medium">{errors.vendorId}</p>
              )}

              {selectedVendor && (
                <div className="mt-2 rounded-lg bg-surface-subtle border border-line p-2.5 text-xs text-muted-ink space-y-0.5">
                  <p className="font-semibold text-ink">{selectedVendor.contactName} · {selectedVendor.contactPhone}</p>
                  <p>{selectedVendor.contactEmail}</p>
                  <p className="font-serif text-[11px] text-brand">
                    {selectedVendor.payoutMethod === 'MPESA'
                      ? `M-Pesa: ${selectedVendor.tillNumber ? `Till ${selectedVendor.tillNumber}` : `Paybill ${selectedVendor.paybillNumber}`}`
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
                onChange={(e) => setInvoiceNumber(e.target.value)}
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

        {/* Section 2: Amount & Live Approval Routing Preview */}
        <div>
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-line pb-2 flex items-center gap-2">
            <CreditCard className="size-4 text-brand" />
            <span>2. Payable Amount & Policy Routing</span>
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Amount */}
            <div>
              <label htmlFor="amount-input" className="block text-xs font-semibold text-ink">
                Requested Amount (KES) <span className="text-err">*</span>
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-serif text-sm font-semibold text-muted-ink">
                  KES
                </span>
                <input
                  id="amount-input"
                  type="number"
                  step="100"
                  min="1"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full rounded-md border bg-surface py-2 pl-12 pr-3 font-serif text-lg font-semibold text-ink placeholder:text-muted-ink focus:outline-none focus:ring-2 ${
                    errors.amount
                      ? 'border-err focus:border-err focus:ring-err/20'
                      : 'border-line focus:border-brand focus:ring-brand/20'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-err font-medium">{errors.amount}</p>
              )}
              {numericAmount > 0 && (
                <p className="mt-1 text-xs text-brand font-semibold font-serif">
                  {formatCurrency(numericAmount)}
                </p>
              )}
            </div>

            {/* Live Routing Preview Card */}
            <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-ink uppercase tracking-wider">
                  Required Approval Chain
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    route.isDual
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {route.label}
                </span>
              </div>
              <p className="text-xs text-muted-ink">
                {numericAmount > 50000 ? (
                  <>
                    Amounts above <strong className="text-ink">KES 50,000</strong> require <strong className="text-ink">Step 1: Manager</strong> review, followed by <strong className="text-ink">Step 2: Finance Officer</strong> authorization before disbursement.
                  </>
                ) : (
                  <>
                    Amounts up to <strong className="text-ink">KES 50,000</strong> are within managerial sign-off threshold and proceed directly to payment release upon manager approval.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Project, Method & Date */}
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
              <select
                id="project-select"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className={`mt-1.5 w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 font-serif ${
                  errors.project
                    ? 'border-err focus:border-err focus:ring-err/20'
                    : 'border-line focus:border-brand focus:ring-brand/20'
                }`}
              >
                <option value="">-- Choose project site --</option>
                {projects.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>
              {errors.project && (
                <p className="mt-1 text-xs text-err font-medium">{errors.project}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="method-select" className="block text-xs font-semibold text-ink">
                Disbursement Channel <span className="text-err">*</span>
              </label>
              <select
                id="method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 font-serif"
              >
                <option value="MPESA">M-Pesa Payout</option>
                <option value="BANK_TRANSFER">Bank</option>
              </select>
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
                onChange={(e) => setRequestedDate(e.target.value)}
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

        {/* Section 4: Purpose & Notes */}
        <div>
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-line pb-2 flex items-center gap-2">
            <Info className="size-4 text-brand" />
            <span>4. Requisition Purpose & Supporting Notes</span>
          </h2>

          <div className="mt-4 space-y-4">
            {/* Reason */}
            <div>
              <label htmlFor="reason-input" className="block text-xs font-semibold text-ink">
                Payment Purpose / Deliverable Description <span className="text-err">*</span>
              </label>
              <input
                id="reason-input"
                type="text"
                placeholder="e.g. 500 bags Portland 42.5 cement delivery for block B foundation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`mt-1.5 w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-ink focus:outline-none focus:ring-2 ${
                  errors.reason
                    ? 'border-err focus:border-err focus:ring-err/20'
                    : 'border-line focus:border-brand focus:ring-brand/20'
                }`}
              />
              {errors.reason && (
                <p className="mt-1 text-xs text-err font-medium">{errors.reason}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes-input" className="block text-xs font-semibold text-ink">
                Internal Supporting Notes & Verification Remarks (Optional)
              </label>
              <textarea
                id="notes-input"
                rows={3}
                placeholder="Add any additional context, delivery note receipt number, site engineer confirmation…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-line bg-surface p-3 text-sm text-ink placeholder:text-muted-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {/* File Upload Dropzone */}
            <div className="rounded-xl border-2 border-dashed border-line bg-canvas p-6 text-center hover:border-brand/40 transition-colors cursor-pointer">
              <UploadCloud className="mx-auto size-8 text-muted-ink/60" />
              <p className="mt-2 text-xs font-semibold text-ink">
                Drag and drop vendor invoice PDF or delivery note (Optional)
              </p>
              <p className="text-[11px] text-muted-ink mt-0.5">
                PDF, PNG, JPG up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end border-t border-line pt-6">
          <Link
            href="/manager/requests"
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
