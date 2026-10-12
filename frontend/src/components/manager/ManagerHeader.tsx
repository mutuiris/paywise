'use client';

import React, { FormEvent } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Menu, Search, Bell } from 'lucide-react';
import { CURRENT_MANAGER } from '@/data/mock-manager-data';

const INITIALS = CURRENT_MANAGER.name
  .split(' ')
  .map((part) => part.charAt(0))
  .join('')
  .toUpperCase();

const FILTERABLE_PAGES = [
  '/manager/requests',
  '/manager/vendors',
  '/manager/approvals',
  '/manager/reports',
];

export function ManagerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  const handleQueryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // On list pages the query is already live-filtering the table via ?q=.
    if (FILTERABLE_PAGES.some((page) => pathname.startsWith(page))) return;
    // Otherwise jump to the requests list with the current query.
    const trimmed = searchQuery.trim();
    router.push(
      trimmed
        ? `/manager/requests?q=${encodeURIComponent(trimmed)}`
        : '/manager/requests'
    );
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6">
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="grid size-9 place-items-center rounded-md border border-line text-ink hover:bg-canvas lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </button>

      {/* Global Search */}
      <form
        role="search"
        onSubmit={handleSearchSubmit}
        className="relative hidden max-w-sm flex-1 sm:block"
      >
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
          value={searchQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search requests, vendors, invoices…"
          className="w-full rounded-md border border-line bg-canvas/60 py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-muted-ink/70 focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
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
            {INITIALS}
          </span>
          <span className="hidden text-left md:block">
            <span className="block text-[13px] font-medium leading-tight text-ink">
              {CURRENT_MANAGER.name}
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
