import { LucideIcon } from 'lucide-react';

export interface StepItem {
  number: string;
  title: string;
  description: string;
  icon?: LucideIcon;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface PlatformLink {
  label: string;
  href: string;
}

export interface ContactDetail {
  title: string;
  value: string;
  href?: string;
  icon: LucideIcon;
}
