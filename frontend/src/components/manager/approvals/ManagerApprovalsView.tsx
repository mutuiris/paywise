'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { approvalService, authService, paymentService } from '@/lib/api/services';
import { ApprovalStepType, PaymentRequestItem } from '@/types/manager';
import { CURRENT_MANAGER, INITIAL_PAYMENT_REQUESTS } from '@/data/mock-manager-data';
import { ManagerApprovalsHeader } from './ManagerApprovalsHeader';
import { ManagerApprovalsStats } from './ManagerApprovalsStats';
import { ManagerApprovalsTable } from './ManagerApprovalsTable';
import { RejectionModal } from '@/components/approvals/RejectionModal';
import { AlertCircle, RefreshCw, Loader2, Database } from 'lucide-react';

/**
 * Demo mode renders the sample records instead of calling the backend, so a
 * walkthrough never depends on a running API.
 */
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const ROLE_LABELS: Record<string, string> = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  FINANCE: 'Finance Officer',
  FINANCE_OFFICER: 'Finance Officer',
  ADMIN: 'Administrator',
  ADMINISTRATOR: 'Administrator',
};

/** Sample records for demo mode. */
const DEMO_REQUESTS: PaymentRequestItem[] = INITIAL_PAYMENT_REQUESTS.map((request) => ({
  ...request,
  requiredTiers: request.amount > 50000 ? ['MANAGER', 'FINANCE'] : ['MANAGER'],
  pendingTiers: request.amount > 50000 ? ['MANAGER', 'FINANCE'] : ['MANAGER'],
}));

/** Sums decimal amounts in minor units, so no float rounding creeps in. */
function sumMinorUnits(amounts: string[]): bigint {
  return amounts.reduce<bigint>((total, amount) => {
    const [whole = '0', fraction = '00'] = amount.split('.');
    return total + BigInt(whole) * BigInt(100) + BigInt(fraction.slice(0, 2).padEnd(2, '0'));
  }, BigInt(0));
}

function formatMinorUnits(minor: bigint): string {
  const whole = minor / BigInt(100);
  const fraction = (minor % BigInt(100)).toString().padStart(2, '0');
  const grouped = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction === '00' ? `KES ${grouped}` : `KES ${grouped}.${fraction}`;
}

interface QueueBundle {
  requests: PaymentRequestItem[];
  currentUserId: string | null;
  approverName: string;
  approverRole: string;
  tier?: 'MANAGER' | 'FINANCE';
  oldestAge: string;
}

function describeAge(hours: number): string {
  if (hours < 1) return 'Under 1 hr';
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'}`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}

/** The approval tier the signed-in role is able to act on. */
function tierForRole(role: string | undefined): 'MANAGER' | 'FINANCE' | undefined {
  if (role === 'FINANCE_OFFICER' || role === 'FINANCE') return 'FINANCE';
  if (role === 'ADMINISTRATOR' || role === 'ADMIN') return undefined;
  return 'MANAGER';
}

export function ManagerApprovalsView() {
  const [bundle, setBundle] = useState<QueueBundle>({
    requests: [],
    currentUserId: null,
    approverName: 'Signed-in approver',
    approverRole: 'Approver',
    oldestAge: '—',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<PaymentRequestItem | null>(null);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchQueue = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    setError(null);

    if (DEMO_MODE) {
      setBundle({
        requests: DEMO_REQUESTS,
        currentUserId: null,
        approverName: CURRENT_MANAGER.name,
        approverRole: 'Manager',
        tier: 'MANAGER',
        oldestAge: '2 days',
      });
      setLoading(false);
      return;
    }

    try {
      // The identity decides which approval tier this queue belongs to, so it
      // is resolved first: a finance officer has no manager-tier queue.
      const me = await authService.getMe().catch(() => null);
      const tier = tierForRole(me?.role);

      const [queue, requests] = await Promise.all([
        approvalService.getQueue(tier ? { tier } : {}),
        paymentService.listRequests({ limit: '500' }),
      ]);

      // The queue endpoint does not carry the project or payment method, so
      // they are resolved from the full request list.
      const details = new Map((requests.results ?? []).map((item) => [item.id, item]));

      const mapped: PaymentRequestItem[] = (queue.results ?? []).map((item) => {
        const detail = details.get(item.id);
        const reference = item.invoice_number || `PR-${item.id.slice(0, 6).toUpperCase()}`;

        return {
          id: item.id,
          reference,
          vendorId: item.vendor_id,
          vendorName: item.vendor_name || 'Designated Vendor',
          amount: Number(item.amount),
          amountExact: item.amount,
          currency: item.currency || 'KES',
          invoiceNumber: item.invoice_number || `INV-${item.id.slice(0, 6).toUpperCase()}`,
          reason: item.description,
          project: detail?.project_name || '—',
          paymentMethod:
            (detail?.payment_method as PaymentRequestItem['paymentMethod']) || 'MPESA',
          requestedPaymentDate: item.created_at || '',
          notes: item.description,
          requesterId: item.requester_id || '',
          requesterName: item.requester_name || 'Employee',
          status: item.status,
          createdAt: item.created_at || '',
          updatedAt: item.created_at || '',
          requiredTiers: item.required_tiers as ApprovalStepType[],
          pendingTiers: item.pending_tiers as ApprovalStepType[],
        };
      });

      const approverName =
        [me?.first_name, me?.last_name].filter(Boolean).join(' ').trim() ||
        me?.username ||
        'Signed-in approver';
      const approverRole = me?.role ? ROLE_LABELS[me.role] ?? 'Approver' : 'Approver';

      setBundle({
        requests: mapped,
        currentUserId: me?.id ?? null,
        approverName,
        approverRole,
        tier,
        oldestAge: (() => {
          const timestamps = mapped
            .map((request) => new Date(request.createdAt).getTime())
            .filter((value) => !Number.isNaN(value));
          if (timestamps.length === 0) return '—';
          const hours = Math.max(
            0,
            Math.round((Date.now() - Math.min(...timestamps)) / 3_600_000)
          );
          return describeAge(hours);
        })(),
      });
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'We could not reach the Paywise approval queue.';
      setError(message);
      setBundle({
        requests: [],
        currentUserId: null,
        approverName: 'Signed-in approver',
        approverRole: 'Approver',
        oldestAge: '—',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    void Promise.resolve().then(() => {
      if (ignore) return;
      fetchQueue().catch(() => {
        if (!ignore) setLoading(false);
      });
    });

    return () => {
      ignore = true;
    };
  }, [fetchQueue]);

  const requests = bundle.requests;
  const pending = requests.filter(
    (request) => request.status === 'PENDING_APPROVAL' || request.status === 'SUBMITTED'
  );
  const pendingAmount = sumMinorUnits(
    pending.map((request) => request.amountExact ?? String(request.amount))
  );
  const dualCount = pending.filter((request) => (request.requiredTiers?.length ?? 1) > 1).length;

  const handleApprove = async (req: PaymentRequestItem) => {
    if (DEMO_MODE) {
      showToast('Demo mode: approvals are not sent to a backend.', true);
      return;
    }
    setDecidingId(req.id);
    try {
      await approvalService.approve(req.id);
      showToast(`Approved ${req.reference} (${req.vendorName})`);
      // Re-read the queue so the table always reflects the backend state.
      await fetchQueue();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Approval failed.', true);
    } finally {
      setDecidingId(null);
    }
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!rejectingRequest) return;
    if (DEMO_MODE) {
      showToast('Demo mode: rejections are not sent to a backend.', true);
      setRejectingRequest(null);
      return;
    }
    setDecidingId(rejectingRequest.id);
    try {
      await approvalService.reject(rejectingRequest.id, reason);
      showToast(`Rejected ${rejectingRequest.reference}: ${reason}`);
      setRejectingRequest(null);
      await fetchQueue();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Rejection failed.', true);
    } finally {
      setDecidingId(null);
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
        <ManagerApprovalsHeader
          approverName={bundle.approverName}
          approverRole={bundle.approverRole}
          tier={bundle.tier}
        />
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

      {DEMO_MODE ? (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <Database className="size-4 shrink-0" />
          <span>
            <strong className="font-semibold">Demo data.</strong> Sample records are shown because
            NEXT_PUBLIC_DEMO_MODE is enabled. Nothing is read from or written to a backend in this
            mode.
          </span>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </span>
          <button
            type="button"
            onClick={() => fetchQueue(true)}
            className="inline-flex items-center gap-1.5 self-start rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : null}

      <ManagerApprovalsStats
        pendingCount={pending.length}
        pendingAmount={formatMinorUnits(pendingAmount)}
        dualCount={dualCount}
        oldestAge={bundle.oldestAge}
      />

      {loading && requests.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted-ink flex items-center justify-center gap-2 rounded-xl border border-line bg-surface">
          <Loader2 className="size-4 animate-spin text-brand" />
          <span>Connecting to PayWise backend approval queue…</span>
        </div>
      ) : (
        <ManagerApprovalsTable
          requests={pending}
          onApprove={handleApprove}
          onReject={setRejectingRequest}
          currentUserId={bundle.currentUserId}
          decidingId={decidingId}
        />
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
