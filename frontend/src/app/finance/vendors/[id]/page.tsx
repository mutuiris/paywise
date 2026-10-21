import { Metadata } from 'next';
import { VendorDetail } from '@/components/manager/vendors';

export const metadata: Metadata = {
  title: 'Vendor Profile — Finance — ImaraPay',
  description: 'View vendor settlement channels, banking info and payment requisition history.',
};

export default async function FinanceVendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VendorDetail vendorId={id} basePath="/finance" />;
}
