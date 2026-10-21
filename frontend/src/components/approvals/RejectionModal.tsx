'use client';

import React, { useState } from 'react';

interface RejectionModalProps {
  requestId: string;
  vendorName: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function RejectionModal({ requestId, vendorName, onClose, onSubmit }: RejectionModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 font-serif">
      <div className="bg-surface rounded-xl border border-line shadow-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-base font-bold text-ink">Reject Request {requestId}</h2>
        <p className="text-xs text-muted-ink">
          Provide a mandatory reason for rejecting requisition for <span className="font-semibold text-ink">{vendorName}</span>.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for rejection…"
            className="w-full border border-line rounded-md p-2.5 text-xs focus:border-brand focus:outline-none bg-surface text-ink placeholder:text-muted-ink/70"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 text-xs font-semibold text-ink bg-canvas border border-line hover:bg-surface rounded-md transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-3.5 py-1.5 text-xs font-semibold text-white bg-err hover:bg-err/90 rounded-md transition cursor-pointer">
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
