import { Metadata } from 'next';
import { VendorsList } from '@/components/manager/vendors';

export const metadata: Metadata = {
  title: 'Vendors Directory — PayWise',
  description: 'Manage and review vendor profiles and payment disbursement histories.',
};

export default function VendorsPage() {
  return <VendorsList />;
}
