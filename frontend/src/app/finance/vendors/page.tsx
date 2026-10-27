import { Metadata } from 'next';
import { VendorsList } from '@/components/manager/vendors';

export const metadata: Metadata = {
  title: 'Registered Vendors — Finance — PayWise',
  description: 'Vendor directory, banking accounts and cumulative disbursement totals.',
};

export default function FinanceVendorsPage() {
  return <VendorsList basePath="/finance" />;
}
