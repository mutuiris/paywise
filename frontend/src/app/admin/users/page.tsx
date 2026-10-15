import { Metadata } from 'next';
import { UsersView } from '@/components/admin';

export const metadata: Metadata = {
  title: 'Users Directory — Administrator — PayWise',
  description: 'Manage user access, role assignments, and active states.',
};

export default function AdminUsersPage() {
  return <UsersView />;
}
