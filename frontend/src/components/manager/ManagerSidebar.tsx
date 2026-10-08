'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  SquareCheckBig,
  Building2,
  ChartColumn,
  X,
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

interface ManagerSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function ManagerSidebar({ mobileOpen = false, onClose }: ManagerSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen, onClose]);

  const navContent = (
    <>
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
                  onClick={onClose}
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
        Logout
      </p>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex font-serif">
        {/* Brand Header */}
        <div className="flex h-14 items-center px-4 border-b border-line">
          <Link href="/manager" className="flex items-center">
            <span className="font-serif text-lg font-bold tracking-tight text-brand">
              PayWise
            </span>
          </Link>
        </div>
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface shadow-2xl font-serif">
            {/* Header with Brand & Close button */}
            <div className="flex h-14 items-center justify-between px-4 border-b border-line">
              <Link href="/manager" className="flex items-center" onClick={onClose}>
                <span className="font-serif text-lg font-bold tracking-tight text-brand">
                  PayWise
                </span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-md border border-line text-ink hover:bg-canvas cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
            </div>

            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
