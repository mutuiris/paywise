import { Metadata } from 'next';
import { RequestDetail } from '@/components/manager/requests';

export const metadata: Metadata = {
  title: 'Request Details — Finance — ImaraPay',
  description: 'View vendor payment request details and financial audit trail.',
};

export default async function FinanceRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetail requestId={id} basePath="/finance" />;
}
