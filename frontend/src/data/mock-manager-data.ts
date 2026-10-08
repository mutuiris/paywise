import { PaymentRequestItem, ActivityEvent } from '@/types/manager';

export const CURRENT_MANAGER = {
  id: 'u3',
  name: 'Carol Wanjiku',
  email: 'carol.wanjiku@imaraworks.co.ke',
  role: 'MANAGER',
  department: 'Operations & Engineering',
  approvalLimit: 50000,
  approvalLimitLabel: 'Up to KES 50,000 (Single) · > KES 50,000 (Manager + Finance)',
};

export const INITIAL_PAYMENT_REQUESTS: PaymentRequestItem[] = [
  {
    id: 'pr1',
    reference: 'PR-000123',
    vendorId: 'v1',
    vendorName: 'Metro Hardware Ltd.',
    amount: 24500,
    currency: 'KES',
    invoiceNumber: 'INV-1032',
    reason: 'Site materials & foundation fixings',
    project: 'Nairobi HQ Tower',
    paymentMethod: 'MPESA',
    requestedPaymentDate: '2026-10-09T08:00:00Z',
    notes: 'Delivery note attached at site office. Urgent delivery for tower core.',
    requesterId: 'u1',
    requesterName: 'Alice Mwangi',
    status: 'PENDING_APPROVAL',
    createdAt: '2026-10-07T09:30:00Z',
    submittedAt: '2026-10-07T09:35:00Z',
    updatedAt: '2026-10-07T09:35:00Z',
    approvals: [
      {
        id: 'ap1',
        type: 'MANAGER',
        decision: 'PENDING',
      },
    ],
  },
  {
    id: 'pr2',
    reference: 'PR-000124',
    vendorId: 'v3',
    vendorName: 'SwiftHaul Logistics',
    amount: 67000,
    currency: 'KES',
    invoiceNumber: 'SH-820',
    reason: 'Heavy material transport & flatbed haulage',
    project: 'Thika Road Bridge',
    paymentMethod: 'BANK_TRANSFER',
    requestedPaymentDate: '2026-10-10T08:00:00Z',
    notes: 'Haulage of structural steel segments to bridge staging depot.',
    requesterId: 'u2',
    requesterName: 'Brian Otieno',
    status: 'PENDING_APPROVAL',
    createdAt: '2026-10-06T14:15:00Z',
    submittedAt: '2026-10-06T14:20:00Z',
    updatedAt: '2026-10-06T14:20:00Z',
    approvals: [
      {
        id: 'ap2',
        type: 'MANAGER',
        decision: 'PENDING',
      },
      {
        id: 'ap3',
        type: 'FINANCE',
        decision: 'PENDING',
      },
    ],
  },
  {
    id: 'pr3',
    reference: 'PR-000125',
    vendorId: 'v5',
    vendorName: 'Apex Electricals',
    amount: 148000,
    currency: 'KES',
    invoiceNumber: 'AE-4103',
    reason: 'Substation electrical installation & switchgear',
    project: 'Nairobi HQ Tower',
    paymentMethod: 'BANK_TRANSFER',
    requestedPaymentDate: '2026-10-11T08:00:00Z',
    notes: 'Phase 1 substation cabling and distribution panels.',
    requesterId: 'u2',
    requesterName: 'Brian Otieno',
    status: 'PENDING_APPROVAL',
    createdAt: '2026-10-05T11:00:00Z',
    submittedAt: '2026-10-05T11:05:00Z',
    updatedAt: '2026-10-05T11:05:00Z',
    approvals: [
      {
        id: 'ap4',
        type: 'MANAGER',
        decision: 'PENDING',
      },
      {
        id: 'ap5',
        type: 'FINANCE',
        decision: 'PENDING',
      },
    ],
  },
  {
    id: 'pr4',
    reference: 'PR-000126',
    vendorId: 'v4',
    vendorName: 'PowerHire Kenya',
    amount: 42000,
    currency: 'KES',
    invoiceNumber: 'PH-912',
    reason: 'Excavator rental for site leveling',
    project: 'Kisumu Depot',
    paymentMethod: 'MPESA',
    requestedPaymentDate: '2026-10-04T08:00:00Z',
    notes: 'Weekend 48hr hire for earthworks.',
    requesterId: 'u1',
    requesterName: 'Alice Mwangi',
    status: 'APPROVED',
    createdAt: '2026-10-04T08:00:00Z',
    submittedAt: '2026-10-04T08:10:00Z',
    updatedAt: '2026-10-08T08:30:00Z',
    approvals: [
      {
        id: 'ap6',
        type: 'MANAGER',
        decision: 'APPROVED',
        approverId: 'u3',
        approverName: 'Carol Wanjiku',
        decidedAt: '2026-10-08T08:30:00Z',
      },
    ],
  },
  {
    id: 'pr5',
    reference: 'PR-000127',
    vendorId: 'v2',
    vendorName: 'Prime Cement Supplies',
    amount: 96500,
    currency: 'KES',
    invoiceNumber: 'PC-5510',
    reason: '200 bags Portland 42.5 cement delivery',
    project: 'Mombasa Warehouse',
    paymentMethod: 'BANK_TRANSFER',
    requestedPaymentDate: '2026-10-03T08:00:00Z',
    notes: 'Bulk purchase with contracted discount.',
    requesterId: 'u2',
    requesterName: 'Brian Otieno',
    status: 'APPROVED',
    createdAt: '2026-10-03T10:00:00Z',
    submittedAt: '2026-10-03T10:05:00Z',
    updatedAt: '2026-10-08T09:00:00Z',
    approvals: [
      {
        id: 'ap7',
        type: 'MANAGER',
        decision: 'APPROVED',
        approverId: 'u3',
        approverName: 'Carol Wanjiku',
        decidedAt: '2026-10-08T09:00:00Z',
      },
      {
        id: 'ap8',
        type: 'FINANCE',
        decision: 'PENDING',
      },
    ],
  },
  {
    id: 'pr6',
    reference: 'PR-000128',
    vendorId: 'v6',
    vendorName: 'BlueLine Plumbing',
    amount: 31200,
    currency: 'KES',
    invoiceNumber: 'BL-220',
    reason: 'Plumbing rework block C bathrooms',
    project: 'Nairobi HQ Tower',
    paymentMethod: 'MPESA',
    requestedPaymentDate: '2026-09-29T08:00:00Z',
    notes: 'Completed work inspected by site engineer.',
    requesterId: 'u1',
    requesterName: 'Alice Mwangi',
    status: 'PAID',
    createdAt: '2026-09-29T08:00:00Z',
    submittedAt: '2026-09-29T08:05:00Z',
    updatedAt: '2026-09-30T14:00:00Z',
    approvals: [
      {
        id: 'ap9',
        type: 'MANAGER',
        decision: 'APPROVED',
        approverId: 'u3',
        approverName: 'Carol Wanjiku',
        decidedAt: '2026-09-29T10:00:00Z',
      },
    ],
  },
  {
    id: 'pr7',
    reference: 'PR-000133',
    vendorId: 'v2',
    vendorName: 'Prime Cement Supplies',
    amount: 12400,
    currency: 'KES',
    invoiceNumber: 'PC-5498',
    reason: 'Cement top-up for plastering',
    project: 'Kisumu Depot',
    paymentMethod: 'MPESA',
    requestedPaymentDate: '2026-10-01T08:00:00Z',
    notes: 'Supplier quoted higher rate than agreed master catalog.',
    requesterId: 'u1',
    requesterName: 'Alice Mwangi',
    status: 'REJECTED',
    createdAt: '2026-10-01T09:00:00Z',
    submittedAt: '2026-10-01T09:05:00Z',
    updatedAt: '2026-10-01T11:20:00Z',
    approvals: [
      {
        id: 'ap10',
        type: 'MANAGER',
        decision: 'REJECTED',
        approverId: 'u3',
        approverName: 'Carol Wanjiku',
        decidedAt: '2026-10-01T11:20:00Z',
        reason: 'Rate per bag exceeds the framework contract price. Please adjust and resubmit.',
      },
    ],
  },
];

export const INITIAL_ACTIVITY_LOG: ActivityEvent[] = [
  {
    id: 'act1',
    at: '2026-10-08T09:00:00Z',
    actorName: 'Carol Wanjiku',
    action: 'Approved payment',
    entity: 'PaymentRequest',
    requestReference: 'PR-000127',
    description: 'Manager approval for PR-000127 (Prime Cement Supplies — KES 96,500)',
  },
  {
    id: 'act2',
    at: '2026-10-08T08:30:00Z',
    actorName: 'Carol Wanjiku',
    action: 'Approved payment',
    entity: 'PaymentRequest',
    requestReference: 'PR-000126',
    description: 'Manager approval for PR-000126 (PowerHire Kenya — KES 42,000)',
  },
  {
    id: 'act3',
    at: '2026-10-07T09:35:00Z',
    actorName: 'Alice Mwangi',
    action: 'Submitted payment request',
    entity: 'PaymentRequest',
    requestReference: 'PR-000123',
    description: 'Submitted PR-000123 for Metro Hardware Ltd. (KES 24,500)',
  },
  {
    id: 'act4',
    at: '2026-10-06T14:20:00Z',
    actorName: 'Brian Otieno',
    action: 'Submitted payment request',
    entity: 'PaymentRequest',
    requestReference: 'PR-000124',
    description: 'Submitted PR-000124 for SwiftHaul Logistics (KES 67,000)',
  },
  {
    id: 'act5',
    at: '2026-10-01T11:20:00Z',
    actorName: 'Carol Wanjiku',
    action: 'Rejected payment',
    entity: 'PaymentRequest',
    requestReference: 'PR-000133',
    description: 'Rejected PR-000133 due to price rate mismatch against framework',
  },
];

export function formatCurrency(amount: number): string {
  return `KES ${new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(amount)}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getApprovalRoute(amount: number): {
  label: string;
  isDual: boolean;
} {
  if (amount > 50000) {
    return {
      label: 'Manager + Finance approval',
      isDual: true,
    };
  }
  return {
    label: 'Manager approval',
    isDual: false,
  };
}
