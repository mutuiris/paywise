'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, Bell, ArrowRightLeft } from 'lucide-react';

export const CURRENT_EMPLOYEE = {
  name: 'Bernadette Wambui',
  role: 'Site Engineer',
  department: 'Westlands Project',
};

export default function EmployeeHeader() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

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

        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-xs">
            BW
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-gray-900 leading-tight">
              {CURRENT_EMPLOYEE.name}
            </p>
            <p className="text-[11px] text-gray-400">
              {CURRENT_EMPLOYEE.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
