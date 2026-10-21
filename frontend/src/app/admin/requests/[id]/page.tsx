import { Metadata } from 'next';
import { RequestDetail } from '@/components/manager/requests';

export const metadata: Metadata = {
  title: 'Payment Request Details — Administrator — PayWise',
  description: 'View vendor payment request details, approval timeline, and audit history.',
};

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetail requestId={id} basePath="/admin" />;
}
