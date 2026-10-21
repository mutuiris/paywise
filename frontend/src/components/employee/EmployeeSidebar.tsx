'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Store, 
  BarChart3, 
  PlusCircle 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/employee', icon: LayoutDashboard },
  { name: 'Payment Requests', href: '/employee/requests', icon: FileText, badge: '2' },
  { name: 'Vendors', href: '/employee/vendors', icon: Store },
  { name: 'Reports', href: '/employee/reports', icon: BarChart3 },
];

export default function EmployeeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 text-gray-800 flex flex-col justify-between shrink-0">
      <div>
        {/* PayWise Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link
            href="/employee"
            className="flex items-center py-1 transition-transform hover:scale-[1.02]"
          >
            <Image
              src="/images/logo.png"
              alt="PayWise Logo"
              width={160}
              height={50}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Create New Request CTA */}
        <div className="p-4">
          <Link
            href="/employee/requests/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Payment Request</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = 
              pathname === item.href || 
              (item.href !== '/employee' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 bg-blue-600 text-white text-[11px] font-semibold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
        <p className="font-semibold text-gray-600">ImaraWorks Ltd.</p>
        <p className="text-[11px]">Demo environment</p>
      </div>
    </aside>
  );
}
