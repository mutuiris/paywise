import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'brand';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'brand', onConfirm, onCancel,
}: ConfirmModalProps) {
  if (!open) return null;
  const isDanger = tone === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-xl animate-fade-up">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`grid size-9 place-items-center rounded-full ${isDanger ? 'bg-err-light text-err' : 'bg-brand-light text-brand'}`}>
              <AlertCircle className="size-5" />
            </div>
            <h3 className="text-base font-bold text-ink">{title}</h3>
          </div>
          <button type="button" onClick={onCancel} className="text-muted-ink hover:text-ink cursor-pointer" aria-label="Close"><X className="size-4" /></button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-ink">{description}</p>
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button type="button" onClick={onCancel} className="rounded-md border border-line px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-canvas cursor-pointer">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={`rounded-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs cursor-pointer ${isDanger ? 'bg-err hover:bg-err/90' : 'bg-brand hover:bg-brand-deep'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
