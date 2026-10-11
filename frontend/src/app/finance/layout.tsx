import type { Metadata } from 'next';
import { FinanceShell } from '@/components/finance';

export const metadata: Metadata = {
  title: 'Finance Portal — ImaraPay',
  description:
    'Finance Officer portal for secondary payment approvals, disbursement execution, and reconciliation.',
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinanceShell>{children}</FinanceShell>;
}
