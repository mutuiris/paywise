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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Reject Request {requestId}</h2>
        <p className="text-sm text-gray-600">
          Please provide a mandatory reason for rejecting the request for{' '}
          <span className="font-semibold">{vendorName}</span>.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter detailed reason for rejection..."
            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-900"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
