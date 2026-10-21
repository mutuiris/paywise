import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ScrollCue } from './ScrollCue';

export function HeroSection() {
  return (
    <section id="hero" className="relative flex min-h-[82vh] sm:min-h-[86vh] lg:min-h-[88vh] items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 border-b border-slate-200">
      <div className="absolute inset-0 z-0">
        <Image src="/images/hero-bg.jpg" alt="PayWise Architecture" fill priority quality={95} className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.68) 50%, rgba(255, 255, 255, 0.30) 85%, rgba(255, 255, 255, 0.15) 100%)' }} />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#004aad]/30 text-[#004aad] text-xs font-medium tracking-wide shadow-xs backdrop-blur-md">
            <Sparkles className="size-3.5 text-[#004aad]" />
            <span>Vendor Payment & Approval System</span>
          </div>
          <div className="space-y-2.5 sm:space-y-3 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.14]">
              Manage Vendor Payouts, <br />
              <span className="font-light italic bg-gradient-to-r from-[#004aad] via-[#005cd4] to-[#1d4ed8] bg-clip-text text-transparent">Without the Chaos.</span>
            </h1>
            <p className="mt-2.5 text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
              PayWise centralizes vendor payment requests, dual-level approvals, and disbursement tracking into one clear, auditable workflow for ImaraWorks.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1.5 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#004aad] hover:bg-[#003887] text-white font-semibold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 group whitespace-nowrap">
              <span>Sign In to Portal</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform text-white" />
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90 text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs whitespace-nowrap group hover:border-[#004aad]/40 backdrop-blur-sm">
              <span>See How It Works</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform text-[#004aad]" />
            </Link>
          </div>
        </div>
      </div>
      <ScrollCue />
    </section>
  );
}
