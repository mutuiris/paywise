import React from 'react';
import Link from 'next/link';
import { Users, Building2, ChartColumn } from 'lucide-react';

const ACTIONS = [
  { to: '/admin/users', title: 'User Management', desc: 'Manage roles and active states', icon: Users },
  { to: '/admin/vendors', title: 'Vendors Directory', desc: 'Payee contacts and disbursement records', icon: Building2 },
  { to: '/admin/reports', title: 'Financial Reports', desc: 'Inspect spend distribution & compliance', icon: ChartColumn },
];

export function AdminQuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 font-serif">
      {ACTIONS.map((item) => (
        <Link
          key={item.to}
          href={item.to}
          className="group rounded-xl border border-line bg-surface p-4 shadow-2xs transition hover:border-brand/40 hover:bg-canvas"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand">
              <item.icon className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink group-hover:text-brand">{item.title}</h3>
              <p className="mt-0.5 text-xs text-muted-ink">{item.desc}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
