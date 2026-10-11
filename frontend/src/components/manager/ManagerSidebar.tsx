'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  SquareCheckBig,
  Building2,
  ChartColumn,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/requests',
    label: 'Payment Requests',
    icon: FileText,
  },
  {
    to: '/approvals',
    label: 'Approvals',
    icon: SquareCheckBig,
    badge: 3,
  },
  {
    to: '/vendors',
    label: 'Vendors',
    icon: Building2,
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: ChartColumn,
  },
];

export function ManagerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      {/* Navigation */}
      <nav aria-label="Main" className="flex-1 px-2 pt-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.to;
            const Icon = item.icon;

            return (
              <li key={item.to}>
                <Link
                  href={item.to}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand/10 font-medium text-brand-deep'
                      : 'text-muted-ink hover:bg-canvas hover:text-ink'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-brand px-1.5 text-[11px] font-semibold text-brand-foreground">
                      {item.badge}
                      <span className="sr-only"> awaiting your decision</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <p className="border-t border-line px-4 py-3 text-[11px] text-muted-ink">
        Demo environment · mock payment provider
      </p>
    </aside>
  );
}
