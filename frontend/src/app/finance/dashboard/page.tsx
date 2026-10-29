import { Metadata } from 'next';
import { FinanceDashboard } from '@/components/finance/dashboard';

export const metadata: Metadata = {
  title: 'Finance Dashboard — PayWise',
  description:
    'Finance dashboard for secondary payment authorizations, disbursement processing, and reconciliation.',
};

export default function FinanceDashboardPage() {
  return <FinanceDashboard />;
}
