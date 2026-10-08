import { Metadata } from 'next';
import { ManagerDashboard } from '@/components/manager';

export const metadata: Metadata = {
  title: 'Manager Dashboard — PayWise',
  description: 'Manager dashboard with KPI metrics, approval requests and recent activity.',
};

export default function ManagerDashboardPage() {
  return <ManagerDashboard />;
}
