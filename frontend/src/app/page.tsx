import { Metadata } from 'next';
import { SignInCard } from '@/components/auth/SignInCard';

export const metadata: Metadata = {
  title: 'Sign in — PayWise',
  description: 'Vendor payment requests, approvals and processing for ImaraWorks Ltd.',
};

export default function HomePage() {
  return <SignInCard />;
}
