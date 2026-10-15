import { Metadata } from 'next';
import { ManagerApprovalsView } from '@/components/manager/approvals';

export const metadata: Metadata = {
  title: 'Approvals Queue — Manager — PayWise',
  description: 'Review and action pending vendor payment requests needing manager authorization.',
};

export default function ManagerApprovalsPage() {
  return <ManagerApprovalsView />;
}