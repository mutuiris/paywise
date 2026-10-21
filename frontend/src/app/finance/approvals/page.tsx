import { Metadata } from 'next';
import { FinanceApprovalsView } from '@/components/finance/approvals';

export const metadata: Metadata = {
  title: 'Dual Approvals — Finance — ImaraPay',
  description: 'Secondary sign-offs for payments exceeding KES 50,000 threshold.',
};

export default function FinanceApprovalsPage() {
  return <FinanceApprovalsView />;
}
