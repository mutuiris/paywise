'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Building2,
  FileText,
  DollarSign,
  CreditCard,
  CheckCircle,
  Paperclip,
} from 'lucide-react';
import { useApiResource } from '@/hooks/useApiResource';
import { listProjects, listVendors } from '@/api/vendors';
import { createPaymentRequest, submitPaymentRequest } from '@/api/payments';
import {
  DemoDataBanner,
  ErrorState,
} from '@/components/employee/AsyncState';
import { PaymentStatusBadge } from '@/components/employee/StatusBadge';
import { toApiError, type ApiError } from '@/lib/api-client';
import { DEMO_MODE } from '@/lib/config';
import {
  approvalTierForAmount,
  formatKes,
  minorUnitsToDecimal,
  parseMinorUnits,
} from '@/lib/money';
import { demoProjects, demoVendors } from '@/data/demo-employee-data';
import type { PaymentMethod, PaymentRequest, Project, Vendor } from '@/types/domain';

interface FormState {
  vendorId: string;
  projectId: string;
  amount: string;
  invoiceNumber: string;
  paymentMethod: PaymentMethod;
  reason: string;
  supportingNotes: string;
}

const INITIAL_FORM: FormState = {
  vendorId: '',
  projectId: '',
  amount: '',
  invoiceNumber: '',
  paymentMethod: 'MPESA',
  reason: '',
  supportingNotes: '',
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
      {messages.join(' ')}
    </p>
  );
}

export default function NewPaymentRequestPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [created, setCreated] = useState<PaymentRequest | null>(null);

  const options = useApiResource<{ vendors: Vendor[]; projects: Project[] }>(
    'employee-request-options',
    () =>
      DEMO_MODE
        ? Promise.resolve({ vendors: demoVendors, projects: demoProjects })
        : Promise.all([listVendors(), listProjects()]).then(([vendors, projects]) => ({
            vendors,
            projects,
          })),
  );

  const vendors = options.data?.vendors ?? [];
  const projects = options.data?.projects ?? [];

  const fieldErrors = submitError?.fieldErrors ?? {};
  const tier = useMemo(() => approvalTierForAmount(form.amount || '0'), [form.amount]);

  const formLevelError = submitError;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (DEMO_MODE || isSubmitting) return;

    const amountMinor = parseMinorUnits(form.amount);
    if (!form.vendorId || !form.invoiceNumber.trim() || !form.reason.trim() || amountMinor <= BigInt(0)) {
      setSubmitError(
        toApiError(new Error('Please complete all required fields with a valid amount.')),
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const request = await createPaymentRequest({
        vendor_id: form.vendorId,
        project_id: form.projectId || null,
        amount: minorUnitsToDecimal(amountMinor),
        invoice_number: form.invoiceNumber.trim(),
        description: form.reason.trim(),
        payment_method: form.paymentMethod,
        supporting_notes: form.supportingNotes.trim(),
      });
      // Create returns a DRAFT; submitting is what puts it in the approval queue.
      setCreated(await submitPaymentRequest(request.id));
    } catch (error) {
      setSubmitError(toApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (created) {
    const vendorName =
      created.vendor_name ??
      vendors.find((vendor) => vendor.id === created.vendor_id)?.name ??
      'the selected vendor';

    return (
      <div className="max-w-2xl mx-auto my-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Request Saved</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Your request for <span className="font-semibold text-gray-800">{vendorName}</span> (
          {formatKes(created.amount)}) with invoice {created.invoice_number} has been recorded by the
          Paywise backend.
        </p>
        <div className="flex justify-center">
          <PaymentStatusBadge status={created.status} />
        </div>
        <p className="text-xs text-gray-400">
          The request is now owned by your account. You cannot choose the requester.
        </p>
        <div className="flex justify-center">
          <Link
            href="/employee/requests"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2 text-sm rounded-lg shadow-sm transition-colors"
          >
            View my requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <DemoDataBanner />

      <div className="flex items-center gap-4">
        <Link
          href="/employee"
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Payment Request</h1>
          <p className="text-sm text-gray-500">
            Submit a vendor invoice or payment request for ImaraWorks project authorization.
          </p>
        </div>
      </div>


      {formLevelError ? (
        <ErrorState
          error={formLevelError}
          onRetry={submitError?.kind === 'network' ? () => setSubmitError(null) : undefined}
          context="We could not submit your request."
        />
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6"
      >
        {options.error && !options.data ? (
          <ErrorState
            error={options.error}
            onRetry={options.reload}
            context="We could not load vendors and projects."
          />
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Vendor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                id="vendorId"
                name="vendorId"
                required
                disabled={options.loading}
                value={form.vendorId}
                onChange={(event) => update('vendorId', event.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent disabled:opacity-60"
              >
                <option value="">
                  {options.loading ? 'Loading vendors...' : '-- Choose Vendor --'}
                </option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <FieldError messages={fieldErrors.vendor_id ?? fieldErrors.vendor} />
          </div>

          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1.5">
              Project / Department <span className="text-red-500">*</span>
            </label>
            <select
              id="projectId"
              name="projectId"
              required
              disabled={options.loading}
              value={form.projectId}
              onChange={(event) => update('projectId', event.target.value)}
              className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent disabled:opacity-60"
            >
              <option value="">{options.loading ? 'Loading projects...' : '-- Choose Project --'}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <FieldError messages={fieldErrors.project_id ?? fieldErrors.project} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount (KES) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="text-xs font-bold text-gray-500 absolute left-3 top-1/2 -translate-y-1/2">
                KES
              </span>
              <input
                id="amount"
                name="amount"
                type="text"
                inputMode="decimal"
                required
                placeholder="24500"
                value={form.amount}
                onChange={(event) => update('amount', event.target.value)}
                className="w-full pl-12 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
            <FieldError messages={fieldErrors.amount} />
          </div>

          <div>
            <label
              htmlFor="invoiceNumber"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Invoice / Reference Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="invoiceNumber"
                name="invoiceNumber"
                type="text"
                required
                placeholder="e.g. INV-1032"
                value={form.invoiceNumber}
                onChange={(event) => update('invoiceNumber', event.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
            <FieldError messages={fieldErrors.invoice_number} />
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          Requests of <strong>KES 50,000 or less</strong> need Manager approval. Requests{' '}
          <strong>above KES 50,000</strong> need Manager and Finance Officer approval.
          {form.amount
            ? tier === 'MANAGER_AND_FINANCE'
              ? ' This request will need Manager and Finance Officer approval.'
              : ' This request will need Manager approval only.'
            : ''}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Preferred Payment Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                form.paymentMethod === 'MPESA'
                  ? 'border-slate-900 bg-slate-50 text-slate-900 font-medium'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="MPESA"
                checked={form.paymentMethod === 'MPESA'}
                onChange={() => update('paymentMethod', 'MPESA')}
                className="text-slate-900 focus:ring-slate-800"
              />
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>M-Pesa</span>
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                form.paymentMethod === 'BANK_TRANSFER'
                  ? 'border-slate-900 bg-slate-50 text-slate-900 font-medium'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="BANK_TRANSFER"
                checked={form.paymentMethod === 'BANK_TRANSFER'}
                onChange={() => update('paymentMethod', 'BANK_TRANSFER')}
                className="text-slate-900 focus:ring-slate-800"
              />
              <DollarSign className="w-5 h-5 text-slate-700" />
              <span>Bank Transfer</span>
            </label>
          </div>
          <FieldError messages={fieldErrors.payment_method} />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1.5">
            Reason for Payment &amp; Details <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            required
            rows={3}
            placeholder="Describe the materials/services requested..."
            value={form.reason}
            onChange={(event) => update('reason', event.target.value)}
            className="w-full p-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
          />
          <FieldError messages={fieldErrors.description} />
        </div>

        <div>
          <label htmlFor="supportingNotes" className="block text-sm font-medium text-gray-700 mb-1.5">
            Supporting Notes
          </label>
          <textarea
            id="supportingNotes"
            name="supportingNotes"
            rows={2}
            placeholder="Any additional context for approvers (optional)"
            value={form.supportingNotes}
            onChange={(event) => update('supportingNotes', event.target.value)}
            className="w-full p-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
          />
          <FieldError messages={fieldErrors.supporting_notes} />
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1.5">
            Attach Invoice / Supporting Documents
          </span>
          <div className="flex items-center gap-3 p-6 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 text-sm text-gray-500 justify-center">
            <Paperclip className="w-5 h-5 shrink-0 text-gray-400" />
            <span>
              Document upload is not available yet: the Paywise payment request model has no
              document field, so the request is recorded with the details and notes above.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <Link
            href="/employee"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || DEMO_MODE || options.loading}
            title={DEMO_MODE ? 'Disabled in demo mode' : undefined}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
          </button>
        </div>

        {DEMO_MODE ? (
          <p className="text-right text-xs text-gray-400">
            Submission is disabled while demo mode is on.
          </p>
        ) : null}
      </form>
    </div>
  );
}
