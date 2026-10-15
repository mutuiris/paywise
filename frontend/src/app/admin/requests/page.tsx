import { Metadata } from 'next';
import { RequestsList } from '@/components/manager/requests';

export const metadata: Metadata = {
  title: 'Payment Requests — Administrator — PayWise',
  description: 'View and audit all vendor payment requests across the organization.',
};

export default function AdminRequestsPage() {
  return <RequestsList basePath="/admin" />;
}
