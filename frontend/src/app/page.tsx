import { Metadata } from 'next';
import { LandingPage } from '@/components/landing';

export const metadata: Metadata = {
  title: 'PayWise — Vendor Payment & Approval Management System',
  description:
    'Vendor payment requests, dual-level approvals, and tracking in one clear, secure, and traceable workflow for ImaraWorks Ltd.',
};

export default function HomePage() {
  return <LandingPage />;
}
