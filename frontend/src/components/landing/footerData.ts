import { Mail, Phone, Clock } from 'lucide-react';
import { PlatformLink, ContactDetail } from './types';

export const PLATFORM_LINKS: PlatformLink[] = [
  { label: 'Overview', href: '#hero' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Key Features', href: '#features' },
];

export const CONTACT_DETAILS: ContactDetail[] = [
  {
    title: 'Email Us',
    value: 'payments@imaraworks.com',
    href: 'mailto:payments@imaraworks.com',
    icon: Mail,
  },
  {
    title: 'Call Us',
    value: '+254 700 123 456',
    href: 'tel:+254700123456',
    icon: Phone,
  },
  {
    title: 'Office Hours',
    value: 'Mon – Fri: 08:00 – 17:00 EAT',
    icon: Clock,
  },
];
