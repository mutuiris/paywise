<<<<<<< HEAD
import { redirect } from 'next/navigation';

export default function ManagerPage() {
  redirect('/manager/dashboard');
=======
import { Metadata } from 'next';
import { ManagerDashboard } from '@/components/manager/dashboard';

export const metadata: Metadata = {
  title: 'Manager — ImaraPay',
  description: 'Manager portal with sidebar and header.',
};

export default function ManagerPage() {
  return <ManagerDashboard />;
>>>>>>> origin/feature/manager-requests-vendors
}

