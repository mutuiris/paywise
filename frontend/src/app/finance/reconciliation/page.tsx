import { Metadata } from 'next';
import { ReconciliationView } from '@/components/finance/reconciliation';

export const metadata: Metadata = {
  title: 'Payment Reconciliation — PayWise',
  description: 'Reconcile payment settlements against gateway transaction references.',
};

export default function FinanceReconciliationPage() {
  return <ReconciliationView />;
}
