'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  FileCheck2,
  Receipt,
  CheckCircle2,
} from 'lucide-react';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* =========================================================================
          1. Header Navigation (Clean Glassmorphism)
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md transition-all">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/20">
              <Image
                src="/images/logo.png"
                alt="PayWise Logo"
                width={28}
                height={28}
                className="h-6 w-auto object-contain brightness-0 invert"
                priority
              />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                Pay<span className="text-blue-400">Wise</span>
              </span>
              <span className="hidden text-[10px] font-mono tracking-wider text-slate-400 uppercase sm:inline-block">
                · ImaraWorks
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              How It Works
            </Link>
            <Link
              href="#portals"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Portals
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-md hover:shadow-blue-600/25 active:scale-95"
            >
              <span>Sign In</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-200 hover:bg-white/5 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-white/10 bg-slate-900/95 px-4 py-4 backdrop-blur-md md:hidden animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-3">
              <Link
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                How It Works
              </Link>
              <Link
                href="#portals"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Portals
              </Link>
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Features
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* =========================================================================
            2. Hero Section (Minimal Information + Crystal Clear Sunrise Image)
               Style modeled closely after mytravel-two.vercel.app
            ========================================================================= */}
        <section
          id="hero"
          className="relative flex min-h-[90vh] sm:min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-20"
        >
          {/* Background Image: Construction Planning Desk at Sunrise */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/construction-planning-hero.png"
              alt="Construction Planning Desk at Sunrise"
              fill
              priority
              quality={95}
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Directional Gradient: Dark on left for crisp contrast, completely clear on right */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.72) 42%, rgba(15, 23, 42, 0.25) 80%, rgba(15, 23, 42, 0.1) 100%)',
              }}
            />
            {/* Subtle bottom vignette to blend smoothly into the next section */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          </div>

          {/* Hero Content — Very Less Information, Punchy & Clean */}
          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div className="max-w-2xl space-y-6 text-left">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-3.5 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-blue-300 backdrop-blur-xs">
                <Sparkles className="size-3.5 text-blue-400" />
                <span>Vendor Payment & Approval System</span>
              </div>

              {/* Main Headline: Bold Serif with Elegant Italic Accent */}
              <div className="space-y-2">
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.12]">
                  Manage Vendor Payouts, <br />
                  <span className="font-light italic text-blue-300">
                    Without the Chaos.
                  </span>
                </h1>
              </div>

              {/* Concise Subtitle (Short & Focused) */}
              <p className="max-w-xl text-base sm:text-lg text-slate-200/90 leading-relaxed font-sans">
                PayWise centralizes vendor payment requests, dual-level approvals, and disbursement
                tracking into one clear, auditable workflow for ImaraWorks.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-600/40 active:scale-95"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30 active:scale-95"
                >
                  <span>See How It Works</span>
                </Link>
              </div>
            </div>
          </div>

          {/* "Scroll to Explore" bouncing indicator like mytravel-two */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 cursor-pointer text-slate-400 hover:text-white transition-colors duration-300">
            <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-slate-400">
              Scroll to Explore
            </span>
            <ChevronDown className="size-4 animate-bounce text-slate-400" />
          </div>
        </section>

        {/* =========================================================================
            3. How It Works (Clean 3-Step Timeline with Number Badges)
            ========================================================================= */}
        <section id="how-it-works" className="relative border-t border-white/10 bg-slate-900/50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-400">
                How PayWise Works
              </span>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                A simple path from request to reconciled payment
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Clear governance that keeps project teams, managers, and finance perfectly aligned.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-sm transition-all hover:border-blue-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-600/20 font-mono text-xs font-bold text-blue-300">
                    01
                  </div>
                  <FileCheck2 className="size-5 text-blue-400" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-white">Submit Request</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Employees initiate payment requests by selecting an approved vendor, specifying the
                  amount, and attaching invoice documents.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-sm transition-all hover:border-blue-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-600/20 font-mono text-xs font-bold text-blue-300">
                    02
                  </div>
                  <ShieldCheck className="size-5 text-blue-400" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-white">Review & Authorize</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Department managers review validity. Requests exceeding KES 50,000 route automatically
                  to Finance for secondary authorization.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-sm transition-all hover:border-blue-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-600/20 font-mono text-xs font-bold text-blue-300">
                    03
                  </div>
                  <Receipt className="size-5 text-blue-400" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-white">Disburse & Reconcile</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Finance executes payment, attaches transaction reference IDs, and updates the permanent,
                  immutable audit trail.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. Role Portals Access (4 Clean Cards)
            ========================================================================= */}
        <section id="portals" className="border-t border-white/10 bg-slate-950 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-400">
                  Role-Based Workspaces
                </span>
                <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Dedicated portals for every team member
                </h2>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                <span>Go to general sign in</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  role: 'Employee Portal',
                  desc: 'Submit requests, track approval status, and browse approved vendors.',
                  url: '/login?role=employee',
                },
                {
                  role: 'Manager Portal',
                  desc: 'Review team submissions, approve line items, or request revisions.',
                  url: '/login?role=manager',
                },
                {
                  role: 'Finance Portal',
                  desc: 'Authorize dual-level payments, disburse funds, and reconcile accounts.',
                  url: '/login?role=finance',
                },
                {
                  role: 'Admin Portal',
                  desc: 'Manage user roles, configure system settings, and inspect audit logs.',
                  url: '/login?role=admin',
                },
              ].map((item) => (
                <Link
                  key={item.role}
                  href={item.url}
                  className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-blue-500/50 hover:bg-slate-900 hover:shadow-lg"
                >
                  <div>
                    <h3 className="font-serif text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {item.role}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <span className="mt-5 text-xs font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    <span>Access Portal</span>
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. Core Highlights / Assurance Row
            ========================================================================= */}
        <section id="features" className="border-t border-white/10 bg-slate-900/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-slate-950/40 p-5">
                <CheckCircle2 className="size-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-white">KES 50,000 Threshold</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Dual-level governance for high-value construction disbursements.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-slate-950/40 p-5">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-white">Duplicate Detection</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Automatic prevention of overlapping invoices and repeat payouts.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-slate-950/40 p-5">
                <CheckCircle2 className="size-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-white">100% Audit Trail</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Immutable timestamps and user attributions for every state change.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          6. Minimal Footer
          ========================================================================= */}
      <footer className="border-t border-white/10 bg-slate-950 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-semibold text-white">PayWise</span>
            <span className="text-xs text-slate-500">· ImaraWorks Ltd © 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="#portals" className="hover:text-white transition-colors">
              Portals
            </Link>
            <Link href="#features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
