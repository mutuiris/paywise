import { Metadata } from 'next';
import { VendorDetail } from '@/components/manager/vendors';

export const metadata: Metadata = {
  title: 'Vendor Profile — PayWise',
  description: 'View vendor settlement details and historical payment requests.',
};

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VendorDetail vendorId={id} />;
}
