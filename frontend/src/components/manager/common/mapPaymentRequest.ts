import type { AuditEventDTO, PaymentRequestDTO } from '@/lib/api/types';
import type { ActivityEvent, PaymentMethod, PaymentRequestItem } from '@/types/manager';

/** The backend sends BANK_TRANSFER; the normalized layer may say BANK. */
export function toPaymentMethod(method: string | null | undefined): PaymentMethod {
  return method === 'BANK' || method === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'MPESA';
}

/** Maps a raw /api/payments/ record to the shape the manager components render. */
export function toRequestItem(r: PaymentRequestDTO): PaymentRequestItem {
  return {
    id: r.id,
    reference: r.invoice_number || `PR-${r.id.slice(0, 6).toUpperCase()}`,
    vendorId: r.vendor_id,
    vendorName: r.vendor_name || 'Unknown vendor',
    amount: parseFloat(r.amount) || 0,
    amountExact: r.amount,
    currency: r.currency || 'KES',
    invoiceNumber: r.invoice_number || '',
    project: r.project_name || '—',
    requesterId: r.requester_id || '',
    requesterName: r.requester_username || 'Unknown requester',
    paymentMethod: toPaymentMethod(r.payment_method),
    requestedPaymentDate: r.created_at || '',
    notes: r.supporting_notes || '',
    reason: r.description,
    status: r.status,
    rejectionReason: r.rejection_reason || undefined,
    createdAt: r.created_at || '',
    updatedAt: r.updated_at || r.created_at || '',
  };
}

export function toActivityEvent(e: AuditEventDTO): ActivityEvent {
  return {
    id: e.id,
    at: e.created_at || '',
    actorName: e.actor_name || (e.actor_email ? e.actor_email.split('@')[0] : 'System'),
    action: e.action,
    entity: e.entity_type,
    // The audit trail points at the request id; consumers resolve it to a reference.
    requestReference: e.entity_id || '',
    description: e.description,
  };
}
