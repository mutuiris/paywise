'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Store, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

const MOCK_VENDORS_DIRECTORY = [
  {
    id: 'VEN-001',
    name: 'Metro Hardware Ltd.',
    category: 'Building Materials (Cement, Steel, Bricks)',
    contactPerson: 'James Mwangi',
    phone: '+254 712 345 678',
    email: 'sales@metrohardware.co.ke',
    location: 'Industrial Area, Nairobi',
    status: 'Verified & Active',
    paymentTerms: '30 Days / Invoice',
  },
  {
    id: 'VEN-002',
    name: 'BuildMax Logistics',
    category: 'Transport & Site Delivery',
    contactPerson: 'Sarah Ochieng',
    phone: '+254 722 987 654',
    email: 'logistics@buildmax.co.ke',
    location: 'Mombasa Road, Nairobi',
    status: 'Verified & Active',
    paymentTerms: 'Immediate / M-Pesa or EFT',
  },
  {
    id: 'VEN-003',
    name: 'Apex Concrete Supplies',
    category: 'Ready-mix Concrete & Aggregates',
    contactPerson: 'David Kiprono',
    phone: '+254 733 112 233',
    email: 'orders@apexconcrete.co.ke',
    location: 'Thika Road, Kiambu',
    status: 'Verified & Active',
    paymentTerms: '14 Days',
  },
  {
    id: 'VEN-004',
    name: 'Safety First Kenya',
    category: 'PPE & Site Safety Equipment',
    contactPerson: 'Amina Mohamed',
    phone: '+254 701 554 433',
    email: 'info@safetyfirst.co.ke',
    location: 'Westlands, Nairobi',
    status: 'Verified & Active',
    paymentTerms: '30 Days',
  },
  {
    id: 'VEN-005',
    name: 'Nairobi Timber & Hardware',
    category: 'Timber, Formwork & Scaffolding',
    contactPerson: 'Peter Kamau',
    phone: '+254 718 223 344',
    email: 'nairobitimber@gmail.com',
    location: 'Gikomba, Nairobi',
    status: 'Verified & Active',
    paymentTerms: 'Cash on Delivery / M-Pesa',
  },
];

export default function EmployeeVendorsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';

  const filteredVendors = MOCK_VENDORS_DIRECTORY.filter(
    (v) =>
      v.name.toLowerCase().includes(query) ||
      v.category.toLowerCase().includes(query) ||
      v.location.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Approved Vendors Directory</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse approved ImaraWorks suppliers and contractors for site payment requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-slate-100 text-slate-800 rounded-xl">
                    <Store className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {vendor.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">{vendor.name}</h3>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">{vendor.category}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-600 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Contact:</span>
                    <span>{vendor.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-xs">{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-xs">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-xs">{vendor.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Terms: <strong className="text-gray-700">{vendor.paymentTerms}</strong></span>
                <span className="font-mono text-gray-400">{vendor.id}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            No approved vendors found matching "{query}".
          </div>
        )}
      </div>
    </div>
  );
}
