import { Metadata } from 'next';
import { RequestsList } from '@/components/manager/requests';

export const metadata: Metadata = {
  title: 'Payment Requests — Finance — PayWise',
  description: 'Track and review vendor payment requests for financial authorization.',
};

export default function FinanceRequestsPage() {
  return <RequestsList basePath="/finance" />;
}
