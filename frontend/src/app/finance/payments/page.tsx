import { Metadata } from 'next';
import { PaymentProcessingView } from '@/components/finance/payments';

export const metadata: Metadata = {
  title: 'Payment Processing — PayWise',
  description: 'Execute vendor payment disbursements through mock settlement gateways.',
};

export default function FinancePaymentsPage() {
  return <PaymentProcessingView />;
}
