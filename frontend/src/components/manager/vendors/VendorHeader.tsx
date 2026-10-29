'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Plus } from 'lucide-react';
import { VendorItem } from '@/types/manager';

interface VendorHeaderProps {
  vendor: VendorItem;
  basePath: string;
}

export function VendorHeader({ vendor, basePath }: VendorHeaderProps) {
  return (
    <div>
      <Link
        href={`${basePath}/vendors`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-ink hover:text-ink transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Vendors</span>
      </Link>

      {/* Vendor Header Row */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {vendor.name}
            </h1>
            {vendor.isActive ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ok/10 text-ok px-2.5 py-0.5 text-xs font-medium border border-ok/30">
                <span className="size-1.5 rounded-full bg-ok" />
                <span>Active</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-muted-ink px-2.5 py-0.5 text-xs font-medium border border-line">
                <span>Inactive</span>
              </span>
            )}
          </div>
          <p className="text-sm text-muted-ink mt-1 flex items-center gap-2">
            <Building2 className="size-4 text-brand shrink-0" />
            <span>{vendor.service}</span>
          </p>
        </div>

        {basePath !== '/finance' && basePath !== '/admin' && (
          <Link
            href={`${basePath}/requests/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>New Payment to Vendor</span>
          </Link>
        )}
      </div>
    </div>
  );
}
