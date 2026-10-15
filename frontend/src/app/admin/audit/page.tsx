import { Metadata } from 'next';
import { AuditView } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Audit Log — Administrator — PayWise',
  description: 'Immutable system audit log of payment requests, approvals, and user governance actions.',
};

export default function AdminAuditPage() {
  return <AuditView />;
}
