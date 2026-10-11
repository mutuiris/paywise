'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { UserProfile, UserRole } from '@/types/auth';
import { getNavItemsForRole } from '@/config/navigation';

export interface AppSidebarProps {
  role: UserRole;
  basePath: string;
  user: UserProfile;
  badges?: {
    approvals?: number;
    payments?: number;
    reconciliation?: number;
  };
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({
  role,
  basePath,
  badges,
  mobileOpen = false,
  onClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItemsForRole(role, basePath, badges);

  // Close mobile drawer on escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && mobileOpen && onClose) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onClose]);

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Brand Logo & Header */}
      <div className="flex h-14 items-center justify-between border-b border-line px-4">
        <Link
          href={`${basePath}/dashboard`}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <span
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground"
            aria-hidden="true"
          >
            <svg viewBox="0 0 40 40" fill="none" className="size-5">
              <path
                d="M10 12v16M18 12v10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M18 12h7a6 6 0 0 1 0 12h-3"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="m18 28 4 4 9-10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <span className="block font-serif text-lg font-bold tracking-tight text-brand">
              PayWise
            </span>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md border border-line text-muted-ink hover:bg-canvas hover:text-ink lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.to || pathname.startsWith(`${item.to}/`);
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
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className="rounded-full bg-brand px-1.5 text-[11px] font-semibold text-brand-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      <div className="border-t border-line px-4 py-3">
        <p className="text-[11px] text-muted-ink">
          ImaraWorks Ltd · Demo environment
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Container */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        >
          <div
            className="h-full w-72 bg-surface shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
