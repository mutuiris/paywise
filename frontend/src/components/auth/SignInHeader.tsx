import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function SignInHeader() {
  return (
    <div className="mb-8 font-serif">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-ink hover:text-ink mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to PayWise Home</span>
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-muted-ink">
        Vendor payment requests, approvals and tracking for ImaraWorks.
      </p>
    </div>
  );
}
