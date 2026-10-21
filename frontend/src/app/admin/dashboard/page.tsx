import { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Dashboard — Administrator — PayWise',
  description: 'Administrator workspace overview, system metrics, and audit log activity.',
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
