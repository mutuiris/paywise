import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Administrator — PayWise',
  description: 'Administrator portal for user governance, system auditing, and payment oversight.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
