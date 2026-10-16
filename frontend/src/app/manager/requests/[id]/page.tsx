import { Metadata } from 'next';
import { RequestDetail } from '@/components/manager/requests';

export const metadata: Metadata = {
  title: 'Payment Request Details — PayWise',
  description: 'View vendor payment request details and approval status.',
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetail requestId={id} />;
}
