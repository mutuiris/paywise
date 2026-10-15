import { Metadata } from 'next';
import { ManagerReportsView } from '@/components/manager/reports';

export const metadata: Metadata = {
  title: 'Reports & Analytics — Manager — PayWise',
  description: 'Departmental spend breakdown, SLA metrics and policy compliance auditing.',
};

export default function ManagerReportsPage() {
  return <ManagerReportsView />;
}
