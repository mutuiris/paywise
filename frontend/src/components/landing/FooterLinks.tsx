import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PLATFORM_LINKS } from './footerData';

export function FooterLinks() {
  return (
    <div className="md:col-span-1 lg:col-span-3 lg:col-start-7 font-serif">
      <h4 className="font-semibold text-slate-900 mb-3 text-sm tracking-wide">Platform</h4>
      <ul className="space-y-2 text-xs sm:text-sm">
        {PLATFORM_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-slate-600 hover:text-[#004aad] transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/login" className="text-[#004aad] font-medium hover:text-[#003887] transition-colors inline-flex items-center gap-1">
            <span>Sign In to Portal</span>
            <ArrowRight className="size-3" />
          </Link>
        </li>
      </ul>
    </div>
  );
}
