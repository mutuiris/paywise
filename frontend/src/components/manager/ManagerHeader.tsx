'use client';

import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

interface ManagerHeaderProps {
  onMenuClick?: () => void;
}

export function ManagerHeader({ onMenuClick }: ManagerHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6 font-serif">
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={onMenuClick}
        className="grid size-9 place-items-center rounded-md border border-line text-ink hover:bg-canvas lg:hidden cursor-pointer"
        aria-label="Open navigation"
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
          className="w-full rounded-md border border-line bg-canvas/60 py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-muted-ink/70 focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-serif"
        />
      </form>

      {/* Right Controls: Notifications & Manager User Profile */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notifications Button */}
        <button
          type="button"
          className="relative grid size-9 place-items-center rounded-md border border-line text-ink hover:bg-canvas transition-colors"
          aria-label="Notifications, 3 pending approvals"
        >
          <Bell className="size-4" />
          <span
            className="absolute right-1.5 top-1.5 size-2 rounded-full bg-err"
            aria-hidden="true"
          />
        </button>

        {/* Manager User Profile */}
        <div className="flex items-center gap-2 rounded-md px-1.5 py-1 text-ink hover:bg-canvas transition-colors cursor-pointer">
          <span className="grid size-8 place-items-center rounded-full bg-brand/10 text-[12px] font-semibold text-brand-deep">
            CW
          </span>
          <span className="hidden text-left md:block">
            <span className="block text-[13px] font-medium leading-tight text-ink">
              Carol Wanjiku
            </span>
            <span className="block text-[11px] leading-tight text-muted-ink">
              Manager
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
