'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, ArrowLeftRight } from 'lucide-react';
import { UserProfile } from '@/types/auth';

export interface AppHeaderProps {
  user: UserProfile;
  notificationCount?: number;
  onMenuClick?: () => void;
}

export function AppHeader({
  user,
  notificationCount = 3,
  onMenuClick,
}: AppHeaderProps) {
  const alternateRolePath =
    user.role === 'FINANCE' ? '/manager/dashboard' : '/finance/dashboard';
  const alternateRoleName =
    user.role === 'FINANCE' ? 'Switch to Manager' : 'Switch to Finance';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile Menu Trigger */}
      <button
        type="button"
        onClick={onMenuClick}
        className="grid size-9 place-items-center rounded-md border border-line text-ink hover:bg-canvas lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="size-4" />
      </button>

      {/* Global Search */}
      <form role="search" className="relative hidden max-w-sm flex-1 sm:block">
        <label htmlFor="global-search" className="sr-only">
          Search payment requests
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-ink"
        />
        <input
          id="global-search"
          type="search"
          placeholder="Search requests, vendors, invoices…"
          className="w-full rounded-md border border-line bg-canvas/60 py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-muted-ink/70 transition-all focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </form>

      {/* Right Controls */}
      <div className="ml-auto flex items-center gap-2">
        {/* Quick Portal Switcher for Testing */}
        <Link
          href={alternateRolePath}
          className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-muted-ink transition-colors hover:border-brand hover:text-ink md:flex"
          title={`Switch portal view to ${alternateRoleName}`}
        >
          <ArrowLeftRight className="size-3.5" />
          <span>{alternateRoleName}</span>
        </Link>

        {/* Notifications Button */}
        <button
          type="button"
          className="relative grid size-9 place-items-center rounded-md border border-line text-ink transition-colors hover:bg-canvas"
          aria-label={`Notifications, ${notificationCount} pending`}
        >
          <Bell className="size-4" />
          {notificationCount > 0 && (
            <span
              className="absolute right-1.5 top-1.5 size-2 rounded-full bg-err"
              aria-hidden="true"
            />
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 rounded-md px-1.5 py-1 text-ink transition-colors hover:bg-canvas">
          <span className="grid size-8 place-items-center rounded-full bg-brand/10 text-[12px] font-semibold text-brand-deep">
            {user.avatarInitials}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-[13px] font-medium leading-tight text-ink">
              {user.name}
            </span>
            <span className="block text-[11px] leading-tight text-muted-ink">
              {user.title}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
