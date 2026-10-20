import { Metadata } from 'next';
import { NewRequestForm } from '@/components/manager/requests';

export const metadata: Metadata = {
  title: 'New Payment Request — PayWise',
  description: 'Create and submit a new vendor payment request.',
};

export default function NewRequestPage() {
  return <NewRequestForm />;
}
