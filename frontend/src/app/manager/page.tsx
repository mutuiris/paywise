import { Metadata } from 'next';
import { ManagerShell } from '@/components/manager';

export const metadata: Metadata = {
  title: 'Manager — ImaraPay',
  description: 'Manager portal with sidebar and header.',
};

export default function ManagerPage() {
  return <ManagerShell />;
}
