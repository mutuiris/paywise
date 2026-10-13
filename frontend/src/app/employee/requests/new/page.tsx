'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Send, 
  Building2, 
  FileText, 
  DollarSign, 
  CreditCard, 
  FileUp,
  CheckCircle,
  Paperclip,
  X
} from 'lucide-react';

const MOCK_VENDORS = [
  'Metro Hardware Ltd.',
  'BuildMax Logistics',
  'Apex Concrete Supplies',
  'Safety First Kenya',
  'Nairobi Timber & Hardware',
  'TransCounty Haulers',
];

const MOCK_PROJECTS = [
  'Westlands Project',
  'Kilimani Site B',
  'Mombasa Port Terminal Phase 2',
  'Eldoret Warehouse Expansion',
  'Headquarters Renovation',
];

export default function NewPaymentRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    vendorName: '',
    amount: '',
    projectOrDepartment: 'Westlands Project',
    invoiceNumber: '',
    paymentMethod: 'M-Pesa',
    reason: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      setTimeout(() => {
        router.push('/employee');
      }, 2000);
    }, 1200);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Request Submitted!</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Your payment request for <span className="font-semibold text-gray-800">{formData.vendorName}</span> (KES {Number(formData.amount).toLocaleString()}) has been sent for manager approval.
        </p>
        {attachedFile && (
          <p className="text-xs text-slate-800 bg-slate-100 py-1.5 px-3 rounded-full inline-block">
            Attached document: {attachedFile.name}
          </p>
        )}
        <p className="text-xs text-gray-400">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Vendor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                name="vendorName"
                required
                value={formData.vendorName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              >
                <option value="">-- Choose Vendor --</option>
                {MOCK_VENDORS.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Project / Department <span className="text-red-500">*</span>
            </label>
            <select
              name="projectOrDepartment"
              required
              value={formData.projectOrDepartment}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            >
              {MOCK_PROJECTS.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount (KES) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="text-xs font-bold text-gray-500 absolute left-3 top-1/2 -translate-y-1/2">
                KES
              </span>
              <input
                type="number"
                name="amount"
                required
                min="1"
                placeholder="24500"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Invoice / Reference Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="invoiceNumber"
                required
                placeholder="e.g. INV-1032"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Preferred Payment Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                formData.paymentMethod === 'M-Pesa'
                  ? 'border-slate-900 bg-slate-50 text-slate-900 font-medium'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="M-Pesa"
                checked={formData.paymentMethod === 'M-Pesa'}
                onChange={handleChange}
                className="text-slate-900 focus:ring-slate-800"
              />
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>M-Pesa</span>
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                formData.paymentMethod === 'Bank Transfer'
                  ? 'border-slate-900 bg-slate-50 text-slate-900 font-medium'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="Bank Transfer"
                checked={formData.paymentMethod === 'Bank Transfer'}
                onChange={handleChange}
                className="text-slate-900 focus:ring-slate-800"
              />
              <DollarSign className="w-5 h-5 text-slate-700" />
              <span>Bank Transfer</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reason for Payment & Details <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            required
            rows={3}
            placeholder="Describe the materials/services requested..."
            value={formData.reason}
            onChange={handleChange}
            className="w-full p-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Attach Invoice / Supporting Documents
          </label>

          {!attachedFile ? (
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-slate-800 hover:bg-slate-50/30 transition-colors cursor-pointer bg-gray-50/50">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileUp className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop invoice document</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, or PDF (Up to 10MB)</p>
            </label>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
              <div className="flex items-center gap-3">
                <Paperclip className="w-5 h-5 text-slate-700 shrink-0" />
                <div className="truncate">
                  <p className="font-medium truncate">{attachedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(attachedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
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
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
