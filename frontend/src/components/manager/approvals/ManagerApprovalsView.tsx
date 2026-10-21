'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CURRENT_MANAGER, INITIAL_PAYMENT_REQUESTS } from '@/data/mock-manager-data';
import { PaymentRequestItem } from '@/types/manager';
import { ManagerApprovalsHeader } from './ManagerApprovalsHeader';
import { ManagerApprovalsStats } from './ManagerApprovalsStats';
import { ManagerApprovalsTable } from './ManagerApprovalsTable';
import { RejectionModal } from '@/components/approvals/RejectionModal';
import { approvalService } from '@/lib/api/services';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export function ManagerApprovalsView() {
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<PaymentRequestItem | null>(null);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchQueue = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const res = await approvalService.getQueue({ tier: 'MANAGER' });
      if (res && res.results && res.results.length > 0) {
        const mapped: PaymentRequestItem[] = res.results.map((q) => ({
          id: q.id,
          reference: q.invoice_number || `PR-${q.id.slice(0, 6).toUpperCase()}`,
          vendorId: q.vendor_id,
          vendorName: q.vendor_name || 'Designated Vendor',
          amount: parseFloat(q.amount) || 0,
          currency: 'KES',
          invoiceNumber: q.invoice_number || `INV-${q.id.slice(0, 6).toUpperCase()}`,
          project: 'ImaraWorks Construction',
          requesterId: q.requester_id || '',
          requesterName: q.requester_name || 'Employee',
          paymentMethod: 'MPESA',
          requestedPaymentDate: q.created_at || new Date().toISOString(),
          notes: q.description || '',
          reason: q.description,
          status: q.status,
          createdAt: q.created_at || new Date().toISOString(),
          updatedAt: q.created_at || new Date().toISOString(),
        }));
        setRequests(mapped);
        setUsingFallback(false);
      } else {
        setRequests(INITIAL_PAYMENT_REQUESTS);
        setUsingFallback(true);
      }
    } catch {
      setRequests(INITIAL_PAYMENT_REQUESTS);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    approvalService
      .getQueue({ tier: 'MANAGER' })
      .then((res) => {
        if (ignore) return;
        if (res && res.results && res.results.length > 0) {
          const mapped: PaymentRequestItem[] = res.results.map((q) => ({
            id: q.id,
            reference: q.invoice_number || `PR-${q.id.slice(0, 6).toUpperCase()}`,
            vendorId: q.vendor_id,
            vendorName: q.vendor_name || 'Designated Vendor',
            amount: parseFloat(q.amount) || 0,
            currency: 'KES',
            invoiceNumber: q.invoice_number || `INV-${q.id.slice(0, 6).toUpperCase()}`,
            project: 'ImaraWorks Construction',
            requesterId: q.requester_id || '',
            requesterName: q.requester_name || 'Employee',
            paymentMethod: 'MPESA',
            requestedPaymentDate: q.created_at || new Date().toISOString(),
            notes: q.description || '',
            reason: q.description,
            status: q.status,
            createdAt: q.created_at || new Date().toISOString(),
            updatedAt: q.created_at || new Date().toISOString(),
          }));
          setRequests(mapped);
          setUsingFallback(false);
        } else {
          setRequests(INITIAL_PAYMENT_REQUESTS);
          setUsingFallback(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (ignore) return;
        setRequests(INITIAL_PAYMENT_REQUESTS);
        setUsingFallback(true);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const pending = requests.filter((r) => r.status === 'PENDING_APPROVAL' || r.status === 'SUBMITTED');
  const pendingAmount = pending.reduce((sum, r) => sum + r.amount, 0);
  const dualCount = pending.filter((r) => r.amount > CURRENT_MANAGER.approvalLimit).length;

  const handleApprove = async (req: PaymentRequestItem) => {
    try {
      await approvalService.approve(req.id);
      setRequests((prev) => prev.filter((i) => i.id !== req.id));
      const isDual = req.amount > CURRENT_MANAGER.approvalLimit;
      showToast(
        `✓ Approved ${req.reference} (${req.vendorName})${
          isDual ? ' — Routed to Finance' : ''
        }`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed.';
      showToast(msg, true);
    }
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!rejectingRequest) return;
    try {
      await approvalService.reject(rejectingRequest.id, reason);
      setRequests((prev) => prev.filter((i) => i.id !== rejectingRequest.id));
      showToast(`Rejected ${rejectingRequest.reference}: ${reason}`);
      setRejectingRequest(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.';
      showToast(msg, true);
    }
  };

  return (
    <div className="space-y-6 font-serif">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-xs font-semibold shadow-lg transition-all ${
            toast.isError ? 'bg-red-800 text-white border border-red-900' : 'bg-ink text-surface'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <ManagerApprovalsHeader />
        <button
          type="button"
          onClick={() => fetchQueue(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>Showing cached demonstration queue (Backend server unreachable). Approvals run in local demonstration mode.</span>
        </div>
      )}

      <ManagerApprovalsStats pendingCount={pending.length} pendingAmount={pendingAmount} dualCount={dualCount} />

      {loading && requests.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted-ink flex items-center justify-center gap-2 rounded-xl border border-line bg-surface">
          <Loader2 className="size-4 animate-spin text-brand" />
          <span>Connecting to PayWise backend approval queue…</span>
        </div>
      ) : (
        <ManagerApprovalsTable requests={pending} onApprove={handleApprove} onReject={setRejectingRequest} />
      )}

      {rejectingRequest && (
        <RejectionModal
          requestId={rejectingRequest.reference}
          vendorName={rejectingRequest.vendorName}
          onClose={() => setRejectingRequest(null)}
          onSubmit={handleRejectSubmit}
        />
      )}
    </div>
  );
}
