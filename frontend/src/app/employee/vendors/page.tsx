'use client';

import React, { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Store, Phone, Mail, ShieldCheck, MapPin } from 'lucide-react';
import { useApiResource } from '@/hooks/useApiResource';
import { listVendors } from '@/api/vendors';
import {
  CardsSkeleton,
  DemoDataBanner,
  EmptyState,
  ErrorState,
} from '@/components/employee/AsyncState';
import { DEMO_MODE } from '@/lib/config';
import { demoVendors } from '@/data/demo-employee-data';
import type { Vendor } from '@/types/domain';

function readPaymentDetail(vendor: Vendor, key: string): string | null {
  const details = vendor.payment_details;
  if (!details || typeof details !== 'object') return null;
  const value = (details as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function EmployeeVendorsContent() {
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();

  const resource = useApiResource<Vendor[]>('employee-vendors', () =>
    DEMO_MODE ? Promise.resolve(demoVendors) : listVendors(),
  );

  const vendors = useMemo(() => resource.data ?? [], [resource.data]);

  const filteredVendors = useMemo(() => {
    if (!query) return vendors;
    return vendors.filter((vendor) =>
      [vendor.name, vendor.service_category, vendor.email, vendor.phone_number, vendor.description]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [vendors, query]);

  const showError = Boolean(resource.error) && !resource.data;

  return (
    <div className="space-y-6">
      <DemoDataBanner />

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Approved Vendors Directory</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse approved ImaraWorks suppliers and contractors for site payment requests.
        </p>
      </div>

      {resource.loading && !showError ? (
        <CardsSkeleton count={6} />
      ) : showError ? (
        <ErrorState
          error={resource.error!}
          onRetry={resource.reload}
          context="We could not load the vendor directory."
        />
      ) : filteredVendors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            title="No approved vendors found"
            description={
              query
                ? `No vendor matches "${query}". Try a different name, category or contact detail.`
                : 'No vendors have been approved yet.'
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => {
            const contactPerson = readPaymentDetail(vendor, 'contact_person');
            const location = readPaymentDetail(vendor, 'location');
            const terms = readPaymentDetail(vendor, 'payment_terms');

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-slate-100 text-slate-800 rounded-xl">
                      <Store className="w-6 h-6" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        vendor.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {vendor.is_active ? 'Verified & Active' : 'Inactive'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{vendor.name}</h3>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">
                      {vendor.service_category || 'General supplier'}
                    </p>
                  </div>

                  {vendor.description ? (
                    <p className="text-sm text-gray-600">{vendor.description}</p>
                  ) : null}

                  <div className="space-y-2 text-sm text-gray-600 pt-2 border-t border-gray-100">
                    {contactPerson ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Contact:</span>
                        <span>{contactPerson}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-xs">
                        {vendor.phone_number || 'No phone on record'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-xs">{vendor.email || 'No email on record'}</span>
                    </div>
                    {location ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-xs">{location}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Terms:{' '}
                    <strong className="text-gray-700">{terms ?? 'As per agreement'}</strong>
                  </span>
                  <span className="font-mono text-gray-400">{vendor.id.slice(0, 8)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EmployeeVendorsPage() {
  return (
    <Suspense fallback={<CardsSkeleton count={6} />}>
      <EmployeeVendorsContent />
    </Suspense>
  );
}
