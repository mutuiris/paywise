import { Metadata } from 'next';
import { FinanceReportsView } from '@/components/finance/reports';

export const metadata: Metadata = {
  title: 'Financial Reports — ImaraPay',
  description: 'Consolidated overview of vendor payments, channels, and compliance audits.',
};

export default function FinanceReportsPage() {
  return <FinanceReportsView />;
}
