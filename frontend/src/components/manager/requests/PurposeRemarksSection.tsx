'use client';

import React from 'react';
import { Info, UploadCloud } from 'lucide-react';

interface PurposeRemarksSectionProps {
  reason: string;
  notes: string;
  error?: string;
  onReasonChange: (val: string) => void;
  onNotesChange: (val: string) => void;
}

export function PurposeRemarksSection({
  reason,
  notes,
  error,
  onReasonChange,
  onNotesChange,
}: PurposeRemarksSectionProps) {
  return (
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
            onChange={(e) => onReasonChange(e.target.value)}
            className={`mt-1.5 w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-ink focus:outline-none focus:ring-2 ${
              error
                ? 'border-err focus:border-err focus:ring-err/20'
                : 'border-line focus:border-brand focus:ring-brand/20'
            }`}
          />
          {error && <p className="mt-1 text-xs text-err font-medium">{error}</p>}
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
            onChange={(e) => onNotesChange(e.target.value)}
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
  );
}
