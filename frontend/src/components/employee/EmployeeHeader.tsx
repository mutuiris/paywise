'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, Bell, ArrowRightLeft } from 'lucide-react';
import { useApiResource } from '@/hooks/useApiResource';
import { getCurrentUser } from '@/api/accounts';
import { DEMO_MODE } from '@/lib/config';
import type { User, UserRole } from '@/types/domain';

const ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE: 'Employee (Requester)',
  MANAGER: 'Manager',
  FINANCE_OFFICER: 'Finance Officer',
  ADMINISTRATOR: 'Administrator',
};

const DEMO_IDENTITY = {
  name: 'Bernadette Wambui',
  role: 'Site Engineer',
};

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function EmployeeHeader() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const userResource = useApiResource<User | null>('employee-header-user', () =>
    DEMO_MODE ? Promise.resolve(null) : getCurrentUser(),
  );

  const user = userResource.data;
  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.username
    : DEMO_MODE
      ? DEMO_IDENTITY.name
      : 'Signed-in employee';
  const roleLabel = user
    ? ROLE_LABELS[user.role]
    : DEMO_MODE
      ? DEMO_IDENTITY.role
      : 'Employee';

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search requests, vendors, invoices..."
          defaultValue={searchParams.get('q')?.toString() || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/manager/dashboard"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-gray-500" />
          <span>Switch to Manager</span>
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-xs">
            {initialsFor(displayName)}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-gray-900 leading-tight">{displayName}</p>
            <p className="text-[11px] text-gray-400">{roleLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
