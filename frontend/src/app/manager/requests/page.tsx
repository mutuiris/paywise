import { Metadata } from 'next';
import { RequestsList } from '@/components/manager/requests';

export const metadata: Metadata = {
  title: 'Payment Requests — PayWise',
  description: 'View and filter all vendor payment requests.',
};

export default function RequestsPage() {
  return <RequestsList />;
}
