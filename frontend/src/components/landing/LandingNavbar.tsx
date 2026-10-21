'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, ArrowRight, Menu, X } from 'lucide-react';
import { MobileMenu } from './MobileMenu';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center py-1 group shrink-0">
          <Image src="/images/logo.png" alt="PayWise Logo" width={160} height={48} className="h-8 sm:h-9 w-auto object-contain" priority />
        </Link>
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-[#004aad] transition-colors">
            How It Works
          </Link>
          <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-[#004aad] transition-colors">
            Features
          </Link>
          <Link href="#location" className="text-sm font-medium text-slate-600 hover:text-[#004aad] transition-colors">
            Location
          </Link>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="#contact" className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:border-[#004aad]/50 hover:text-[#004aad] hover:bg-[#eef5fc]/60 active:scale-95">
            <Phone className="size-3.5 text-[#004aad]" />
            <span>Contact</span>
          </Link>
          <Link href="/login" className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-[#004aad] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#004aad]/20 transition-all hover:bg-[#003887] active:scale-95">
            <span>Sign In</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden" aria-label="Toggle navigation">
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
    </header>
  );
}
