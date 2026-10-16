import { AuditEvent } from '@/types/admin';

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  { id: 'aud-01', at: '2026-10-12T14:32:00Z', actorName: 'Grace Kamau', action: 'Changed user role', entity: 'UserAccount', description: 'Brian Otieno: EMPLOYEE → MANAGER' },
  { id: 'aud-02', at: '2026-10-12T11:15:00Z', actorName: 'Faith Njeri', action: 'Executed payment', entity: 'PaymentExecution', paymentRequestId: 'PR-000127', requestReference: 'PR-000127', description: 'Disbursed KES 96,500 to Prime Cement Supplies' },
  { id: 'aud-03', at: '2026-10-12T09:40:00Z', actorName: 'Grace Kamau', action: 'Activated user', entity: 'UserAccount', description: 'David Mutua was activated. Historical approvals unchanged.' },
  { id: 'aud-04', at: '2026-10-11T16:20:00Z', actorName: 'Carol Wanjiku', action: 'Approved payment', entity: 'PaymentRequest', paymentRequestId: 'PR-000125', requestReference: 'PR-000125', description: 'Manager tier approval granted for KES 148,000' },
  { id: 'aud-05', at: '2026-10-11T15:10:00Z', actorName: 'System', action: 'Failed payment attempt', entity: 'PaymentExecution', paymentRequestId: 'PR-000128', requestReference: 'PR-000128', description: 'M-PESA B2C transaction timeout after retry' },
  { id: 'aud-06', at: '2026-10-11T13:45:00Z', actorName: 'Faith Njeri', action: 'Approved payment', entity: 'PaymentRequest', paymentRequestId: 'PR-000126', requestReference: 'PR-000126', description: 'Finance secondary approval granted for KES 42,000' },
  { id: 'aud-07', at: '2026-10-10T17:00:00Z', actorName: 'Alice Mwangi', action: 'Created request', entity: 'PaymentRequest', paymentRequestId: 'PR-000123', requestReference: 'PR-000123', description: 'Site materials invoice submitted for Metro Hardware' },
  { id: 'aud-08', at: '2026-10-10T10:30:00Z', actorName: 'Grace Kamau', action: 'Updated vendor profile', entity: 'Vendor', description: 'Updated bank disbursement details for Apex Electricals' },
  { id: 'aud-09', at: '2026-10-09T16:05:00Z', actorName: 'Brian Otieno', action: 'Created request', entity: 'PaymentRequest', paymentRequestId: 'PR-000124', requestReference: 'PR-000124', description: 'Heavy transport haulage request submitted' },
  { id: 'aud-10', at: '2026-10-09T11:22:00Z', actorName: 'Carol Wanjiku', action: 'Rejected payment', entity: 'PaymentRequest', paymentRequestId: 'PR-000122', requestReference: 'PR-000122', description: 'Missing delivery note attachment from site manager' },
];
