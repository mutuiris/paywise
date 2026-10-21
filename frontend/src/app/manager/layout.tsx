import type { Metadata } from 'next';
import { ManagerShell } from '@/components/manager';

export const metadata: Metadata = {
  title: 'Manager — PayWise',
  description: 'Manager portal with sidebar, header and dashboard navigation.',
};

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManagerShell>{children}</ManagerShell>;
}
