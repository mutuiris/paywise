import { Metadata } from 'next';
import { ManagerReportsView } from '@/components/manager/reports';

export const metadata: Metadata = {
  title: 'Reports — Administrator — PayWise',
  description: 'Department spend distribution, approval SLAs, and governance compliance auditing.',
};

export default function AdminReportsPage() {
  return <ManagerReportsView />;
}
