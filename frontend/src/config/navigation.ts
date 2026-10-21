import React from 'react';
import {
  LayoutDashboard,
  FileText,
  SquareCheckBig,
  Banknote,
  Scale,
  Building2,
  ChartColumn,
  ScrollText,
  Users,
} from 'lucide-react';
import { Capability, UserRole, hasCapability } from '@/types/auth';

export interface NavItemConfig {
  segment: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  capability?: Capability;
  badgeKey?: 'approvals' | 'payments' | 'reconciliation';
}

export const ALL_NAV_ITEMS: NavItemConfig[] = [
  {
    segment: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    segment: 'requests',
    label: 'Payment Requests',
    icon: FileText,
  },
  {
    segment: 'approvals',
    label: 'Approvals',
    icon: SquareCheckBig,
    capability: 'approvals.view',
    badgeKey: 'approvals',
  },
  {
    segment: 'payments',
    label: 'Payment Processing',
    icon: Banknote,
    capability: 'payments.process',
    badgeKey: 'payments',
  },
  {
    segment: 'reconciliation',
    label: 'Reconciliation',
    icon: Scale,
    capability: 'reconciliation.view',
    badgeKey: 'reconciliation',
  },
  {
    segment: 'vendors',
    label: 'Vendors',
    icon: Building2,
    capability: 'vendors.view',
  },
  {
    segment: 'reports',
    label: 'Reports',
    icon: ChartColumn,
    capability: 'reports.view',
  },
  {
    segment: 'audit',
    label: 'Audit Log',
    icon: ScrollText,
    capability: 'audit.view',
  },
  {
    segment: 'users',
    label: 'Users',
    icon: Users,
    capability: 'users.manage',
  },
];

export interface ResolvedNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function getNavItemsForRole(
  role: UserRole,
  basePath: string,
  badges?: {
    approvals?: number;
    payments?: number;
    reconciliation?: number;
  }
): ResolvedNavItem[] {
  return ALL_NAV_ITEMS.filter((item) => hasCapability(role, item.capability)).map((item) => {
    let badge: number | undefined;
    if (item.badgeKey && badges?.[item.badgeKey]) {
      badge = badges[item.badgeKey];
    }

    return {
      to: `${basePath}/${item.segment}`,
      label: item.label,
      icon: item.icon,
      badge,
    };
  });
}
