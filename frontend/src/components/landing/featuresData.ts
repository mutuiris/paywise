import {
  CreditCard,
  ShieldCheck,
  Activity,
  CopyCheck,
  History,
  BarChart3,
} from 'lucide-react';
import { FeatureItem } from './types';

export const FEATURES: FeatureItem[] = [
  {
    title: 'Payment Requests',
    description: 'Submit vendor invoices quickly and easily.',
    icon: CreditCard,
  },
  {
    title: 'Smart Approvals',
    description: 'Automate approvals based on payment amounts.',
    icon: ShieldCheck,
  },
  {
    title: 'Payment Tracking',
    description: 'Track every payment from request to completion.',
    icon: Activity,
  },
  {
    title: 'Duplicate Protection',
    description: 'Prevent duplicate invoices and payments.',
    icon: CopyCheck,
  },
  {
    title: 'Audit Trail',
    description: 'Record every action, approval and change.',
    icon: History,
  },
  {
    title: 'Reports',
    description: 'View payment activity and reconciliation reports.',
    icon: BarChart3,
  },
];
