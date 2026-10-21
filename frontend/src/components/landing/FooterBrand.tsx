import Image from 'next/image';
import Link from 'next/link';

export function FooterBrand() {
  return (
    <div className="lg:col-span-5 space-y-3">
      <Link href="/" className="inline-block">
        <Image src="/images/logo.png" alt="PayWise Logo" width={180} height={50} className="h-9 sm:h-10 w-auto object-contain" />
      </Link>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
        PayWise is an enterprise payment request and tiered approval workflow
        platform for construction and infrastructure engineering. Centralizing dual-level approvals,
        audit governance, and automated disbursements.
      </p>
    </div>
  );
}
