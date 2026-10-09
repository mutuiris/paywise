import { Metadata } from 'next';
import { SignInCard } from '@/components/auth/SignInCard';

export const metadata: Metadata = {
  title: 'Sign in — ImaraPay',
  description: 'Vendor payment requests, approvals and processing for ImaraWorks Ltd.',
};

export default function LoginPage() {
  return <SignInCard />;
}
