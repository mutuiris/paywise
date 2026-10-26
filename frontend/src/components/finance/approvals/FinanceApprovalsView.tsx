'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PendingFinanceApproval, MOCK_FINANCE_APPROVALS } from './types';
import { FinanceApprovalsHeader } from './FinanceApprovalsHeader';
import { FinanceApprovalsStats } from './FinanceApprovalsStats';
import { FinanceApprovalItem } from './FinanceApprovalItem';
import { RejectionModal } from '@/components/approvals/RejectionModal';
import { approvalService } from '@/lib/api/services';
import { getClientUser } from '@/lib/auth/session';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export function FinanceApprovalsView() {
  const [items, setItems] = useState<PendingFinanceApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [rejectingItem, setRejectingItem] = useState<PendingFinanceApproval | null>(null);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const currentUser = getClientUser();

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchQueue = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await approvalService.getQueue({ tier: 'FINANCE' });
      const apiItems: PendingFinanceApproval[] = (res.results || []).map((req) => ({
        id: req.id,
        reference: req.invoice_number || `PR-${req.id.slice(0, 6).toUpperCase()}`,
        vendorName: req.vendor_name || 'Designated Vendor',
        amount: parseFloat(req.amount) || 0,
        reason: req.description || 'Vendor requisition',
        requesterId: req.requester_id || undefined,
        requesterName: req.requester_name || 'Employee',
        project: 'ImaraWorks Construction',
        managerApprovedBy: req.approved_tiers?.includes('MANAGER') ? 'Manager Clearance' : 'Pending Manager',
        managerApprovedAt: req.created_at || new Date().toISOString(),
        invoiceNumber: req.invoice_number,
      }));

      setItems(apiItems);
      setUsingFallback(false);
    } catch (err: unknown) {
      // Backend not running or unauthenticated
      setUsingFallback(true);
      setItems(MOCK_FINANCE_APPROVALS);
      const msg = err instanceof Error ? err.message : 'Failed to fetch approvals from server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    approvalService
      .getQueue({ tier: 'FINANCE' })
      .then((res) => {
        if (ignore) return;
        const apiItems: PendingFinanceApproval[] = (res.results || []).map((req) => ({
          id: req.id,
          reference: req.invoice_number || `PR-${req.id.slice(0, 6).toUpperCase()}`,
          vendorName: req.vendor_name || 'Designated Vendor',
          amount: parseFloat(req.amount) || 0,
          reason: req.description || 'Vendor requisition',
          requesterId: req.requester_id || undefined,
          requesterName: req.requester_name || 'Employee',
          project: 'ImaraWorks Construction',
          managerApprovedBy: req.approved_tiers?.includes('MANAGER') ? 'Manager Clearance' : 'Pending Manager',
          managerApprovedAt: req.created_at || new Date().toISOString(),
          invoiceNumber: req.invoice_number,
        }));

        setItems(apiItems);
        setUsingFallback(false);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setUsingFallback(true);
        setItems(MOCK_FINANCE_APPROVALS);
        const msg = err instanceof Error ? err.message : 'Failed to fetch approvals from server.';
        setError(msg);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleApprove = async (item: PendingFinanceApproval) => {
    try {
      await approvalService.approve(item.id);
      showToast(`✓ Dual approval recorded for ${item.reference}. Queued for disbursement.`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed.';
      showToast(msg, true);
    }
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!rejectingItem) return;
    try {
      await approvalService.reject(rejectingItem.id, reason);
      showToast(`Rejected ${rejectingItem.reference}: ${reason}`);
      setItems((prev) => prev.filter((i) => i.id !== rejectingItem.id));
      setRejectingItem(null);
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
        <FinanceApprovalsHeader />
        <button
          type="button"
          onClick={() => fetchQueue(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>Showing cached demonstration queue ({error || 'Backend service unreachable'}). Dual approvals are simulated in local mode.</span>
        </div>
      )}

      <FinanceApprovalsStats
        pendingCount={items.length}
        totalPendingAmount={items.reduce((s, i) => s + i.amount, 0)}
      />

      <div className="rounded-xl border border-line bg-surface shadow-2xs divide-y divide-line overflow-hidden">
        <div className="p-5 bg-surface-subtle flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Requisitions Pending Secondary Clearance ({items.length})</h2>
            <p className="text-xs text-muted-ink">Manager approved. Awaiting final Finance authorization for transactions &gt; KES 50,000.</p>
          </div>
          {loading && <Loader2 className="size-4 animate-spin text-brand" />}
        </div>

        {loading && items.length === 0 ? (
          <div className="p-10 text-center text-xs text-muted-ink flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-brand" />
            <span>Connecting to PayWise backend approval queue…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-xs text-muted-ink">
            No requests currently awaiting dual approval. All requisitions above threshold have been cleared.
          </div>
        ) : (
          items.map((item) => {
            const isSelfRequest = Boolean(
              currentUser && (
                (item.requesterId && item.requesterId === currentUser.id) ||
                (item.requesterName && item.requesterName.toLowerCase() === currentUser.name.toLowerCase())
              )
            );
            return (
              <FinanceApprovalItem
                key={item.id}
                item={item}
                isSelfRequest={isSelfRequest}
                onApprove={handleApprove}
                onReject={setRejectingItem}
              />
            );
          })
        )}
      </div>

      {rejectingItem && (
        <RejectionModal
          requestId={rejectingItem.reference}
          vendorName={rejectingItem.vendorName}
          onClose={() => setRejectingItem(null)}
          onSubmit={handleRejectSubmit}
        />
      )}
    </div>
  );
}
