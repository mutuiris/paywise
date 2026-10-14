'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Banknote,
  Building2,
  Scale,
  ScrollText,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Menu,
  X,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas font-serif text-ink antialiased selection:bg-brand/15 selection:text-brand-deep">
      {/* =========================================================================
          1. Sticky Navigation Bar
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-line bg-canvas/90 backdrop-blur-md transition-colors">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="#home"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <span className="font-serif text-xl font-bold tracking-tight text-brand">
              PayWise
            </span>
            <span className="hidden rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-deep sm:inline-block">
              ImaraWorks Ltd.
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="#pillars"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-ink transition-colors hover:bg-canvas hover:text-ink"
            >
              Overview
            </Link>
            <Link
              href="#features"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-ink transition-colors hover:bg-canvas hover:text-ink"
            >
              Key Features
            </Link>
            <Link
              href="#workflow"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-ink transition-colors hover:bg-canvas hover:text-ink"
            >
              How It Works
            </Link>
            <Link
              href="#roles"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-ink transition-colors hover:bg-canvas hover:text-ink"
            >
              Portals
            </Link>
            <Link
              href="#stats"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-ink transition-colors hover:bg-canvas hover:text-ink"
            >
              By The Numbers
            </Link>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-all hover:bg-brand-deep hover:shadow-md active:scale-[0.99]"
            >
              <span>Sign In</span>
              <ArrowRight className="size-4" />
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-9 place-items-center rounded-lg border border-line text-ink hover:bg-surface md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-line bg-surface px-4 py-4 md:hidden animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-2">
              <Link
                href="#pillars"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-ink hover:bg-canvas hover:text-ink"
              >
                Overview
              </Link>
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-ink hover:bg-canvas hover:text-ink"
              >
                Key Features
              </Link>
              <Link
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-ink hover:bg-canvas hover:text-ink"
              >
                How It Works
              </Link>
              <Link
                href="#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-ink hover:bg-canvas hover:text-ink"
              >
                Portals & Roles
              </Link>
              <Link
                href="#stats"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-ink hover:bg-canvas hover:text-ink"
              >
                By The Numbers
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* =========================================================================
            2. Hero Section (Reclaim Layout + Login Page Background Image)
            ========================================================================= */}
        <section
          id="home"
          className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden py-12 lg:py-20"
        >
          {/* Background Image: paywise-signin.png with layered gradient overlays */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/paywise-signin.png"
              alt="PayWise Construction & Vendor Payment Management"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Multi-tier gradient overlay ensuring clean readability in light theme */}
            <div className="absolute inset-0 bg-linear-to-r from-canvas/98 via-canvas/90 to-canvas/40 sm:to-canvas/60 lg:to-canvas/30" />
            <div className="absolute inset-0 bg-linear-to-b from-canvas/80 via-transparent to-canvas" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Left Column: Heading, Subtext, Badges, CTAs */}
              <div className="space-y-6 lg:col-span-7">
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-deep">
                  <Sparkles className="size-3.5 text-brand" />
                  <span>Smarter Payment Management · ImaraWorks</span>
                </div>

                {/* Main Hero Headline */}
                <h1 className="font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.12]">
                  Payments, Without the Guesswork.
                </h1>

                {/* Subheading */}
                <p className="max-w-2xl text-base text-ink-secondary sm:text-lg leading-relaxed">
                  PayWise centralizes vendor payment requests, dual-level approvals,
                  and disbursement tracking into one clear, secure, and traceable workflow
                  for construction and engineering projects.
                </p>

                {/* Fast Stat Badges Row (Inspired by Reclaim's quick partner/researcher counters) */}
                <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
                  <div className="rounded-xl border border-line bg-surface/90 p-3 shadow-2xs backdrop-blur-xs">
                    <div className="text-lg font-bold text-brand">KES 50,000</div>
                    <div className="text-xs text-muted-ink">Dual-approval tier</div>
                  </div>
                  <div className="rounded-xl border border-line bg-surface/90 p-3 shadow-2xs backdrop-blur-xs">
                    <div className="text-lg font-bold text-brand">4 Roles</div>
                    <div className="text-xs text-muted-ink">Segregated governance</div>
                  </div>
                  <div className="col-span-2 rounded-xl border border-line bg-surface/90 p-3 shadow-2xs backdrop-blur-xs sm:col-span-1">
                    <div className="text-lg font-bold text-ok">100% Audit</div>
                    <div className="text-xs text-muted-ink">Immutable action trail</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-base font-semibold text-brand-foreground shadow-md transition-all hover:bg-brand-deep hover:shadow-lg active:scale-[0.99]"
                  >
                    <span>Sign In to Portal</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="#workflow"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-line bg-surface/80 px-6 py-3 text-base font-semibold text-ink backdrop-blur-xs transition-colors hover:border-brand/40 hover:bg-surface"
                  >
                    <span>Explore Workflow</span>
                    <ChevronRight className="size-4 text-muted-ink" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Floating Preview Card (Mock Transaction) */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md rounded-2xl border border-line bg-surface/95 p-6 shadow-xl backdrop-blur-md">
                  <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
                        Live Payment Request
                      </span>
                      <p className="font-serif text-sm font-bold text-ink">
                        REQ-2026-104
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-warn-border bg-warn-light px-2.5 py-0.5 text-xs font-semibold text-warn">
                      <Clock className="size-3" />
                      Pending Review
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-ink">Vendor</span>
                      <p className="font-serif text-base font-bold text-ink">
                        Apex Electricals Ltd.
                      </p>
                      <p className="text-xs text-muted-ink">
                        Section B Substation Cabling
                      </p>
                    </div>

                    <div className="rounded-xl border border-line bg-canvas p-3">
                      <span className="text-xs text-muted-ink">Requested Amount</span>
                      <div className="font-serif text-2xl font-bold tracking-tight text-brand">
                        KES 148,000
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-ink">
                        Exceeds KES 50k threshold · Requires Manager & Finance approvals
                      </p>
                    </div>

                    {/* Stepper Progress Indicator */}
                    <div className="pt-2">
                      <div className="mb-1.5 flex justify-between text-xs text-muted-ink">
                        <span>Workflow Progress</span>
                        <span className="font-semibold text-brand">Step 2 of 4</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                        <div className="h-full w-1/2 rounded-full bg-brand" />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-ink">
                        <span className="text-ok font-medium">✓ Submitted</span>
                        <span className="text-brand font-semibold">● Manager Review</span>
                        <span>○ Finance</span>
                        <span>○ Paid</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-line pt-3">
                    <Link
                      href="/login"
                      className="flex items-center justify-between text-xs font-semibold text-brand hover:underline"
                    >
                      <span>Sign in to view approvals queue</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. Core Value Pillars (Clear · Secure · Traceable)
            ========================================================================= */}
        <section id="pillars" className="border-y border-line bg-surface-subtle py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Operational Excellence
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Built for High-Trust Corporate Finance
              </h2>
              <p className="mt-3 text-base text-muted-ink sm:text-lg">
                Replaces unverified messaging chats and scattered spreadsheets with
                automated governance, role separation, and financial certainty.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Pillar 1: Clear */}
              <div className="rounded-2xl border border-line bg-surface p-8 shadow-xs transition-all hover:border-brand/40 hover:shadow-md">
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <FileText className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink">
                  Clear
                </h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Know exactly where every payment stands at any moment. Requesters and
                  department leads get real-time status updates from submission to settlement.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-ok shrink-0" />
                    <span>Real-time status tracking for every request</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-ok shrink-0" />
                    <span>Transparent invoice & cost-code association</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 2: Secure */}
              <div className="rounded-2xl border border-line bg-surface p-8 shadow-xs transition-all hover:border-brand/40 hover:shadow-md">
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink">
                  Secure
                </h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Keep approvals and financial disbursements strictly governed. Threshold
                  rules enforce automatic dual signoff on all requests exceeding KES 50,000.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-ok shrink-0" />
                    <span>Strict segregation of financial duties</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-ok shrink-0" />
                    <span>Self-approval prevention guards</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 3: Traceable */}
              <div className="rounded-2xl border border-line bg-surface p-8 shadow-xs transition-all hover:border-brand/40 hover:shadow-md">
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ScrollText className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink">
                  Traceable
                </h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Every submission, review, approval, rejection reason, and gateway callback
                  is recorded with immutable timestamp and user signatures in the audit ledger.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-ok shrink-0" />
                    <span>Complete timestamped decision trail</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-ok shrink-0" />
                    <span>Mandatory rejection rationales</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. Key Features Grid (Reclaim 6-card design layout)
            ========================================================================= */}
        <section id="features" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Key System Capabilities
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Comprehensive Payment Lifecycle Governance
              </h2>
              <p className="mt-3 text-base text-muted-ink sm:text-lg">
                Engineered specifically for ImaraWorks Ltd. to ensure vendor compliance,
                fraud mitigation, and efficient cash-flow oversight.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group rounded-2xl border border-line bg-surface p-6 shadow-2xs transition-all duration-300 hover:border-brand/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                  <FileText className="size-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Structured Payment Requests
                </h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Site engineers submit detailed requests tagged with invoice numbers,
                  project cost codes, and verified supplier disbursement accounts.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-2xl border border-line bg-surface p-6 shadow-2xs transition-all duration-300 hover:border-brand/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                  <Scale className="size-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Tiered Approval Thresholds
                </h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Requests up to KES 50,000 require manager approval. Higher-value payouts
                  automatically require secondary review and authorization by finance.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-2xl border border-line bg-surface p-6 shadow-2xs transition-all duration-300 hover:border-brand/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                  <Building2 className="size-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Approved Vendor Directory
                </h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Maintain verified supplier profiles, bank account numbers, and M-Pesa
                  till/paybills, preventing accidental payments to unvetted contractors.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group rounded-2xl border border-line bg-surface p-6 shadow-2xs transition-all duration-300 hover:border-brand/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                  <ShieldAlert className="size-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Duplicate Payment Guards
                </h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  System monitors vendor IDs, invoice numbers, and submission dates to flag
                  and block duplicate billing attempts before funds leave treasury.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group rounded-2xl border border-line bg-surface p-6 shadow-2xs transition-all duration-300 hover:border-brand/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                  <Banknote className="size-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Disbursement Execution & Reconciliation
                </h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Finance officers execute payouts with integrated provider reference
                  logging and instant matching against bank balances and internal ledgers.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group rounded-2xl border border-line bg-surface p-6 shadow-2xs transition-all duration-300 hover:border-brand/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                  <TrendingUp className="size-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Financial Analytics & Reports
                </h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Aggregated spend breakdowns by project site, vendor category, approval
                  turnaround times, and budget utilization for executive oversight.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. Workflow Process Timeline (Step-by-Step)
            ========================================================================= */}
        <section id="workflow" className="border-t border-line bg-surface-subtle py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Standardized Workflow
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                From Invoice to Verified Settlement
              </h2>
              <p className="mt-3 text-base text-muted-ink sm:text-lg">
                A structured four-step path ensuring speed, compliance, and zero lost receipts.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div className="mb-3 text-xs font-bold text-brand uppercase tracking-wider">
                  Step 01
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Submit Request
                </h3>
                <p className="mt-2 text-sm text-muted-ink">
                  Employee or site engineer enters vendor details, attaches the official
                  invoice, and specifies the construction project code.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div className="mb-3 text-xs font-bold text-brand uppercase tracking-wider">
                  Step 02
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Manager Review
                </h3>
                <p className="mt-2 text-sm text-muted-ink">
                  Department manager verifies that materials or services have been received
                  and signs off within their KES 50,000 threshold.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div className="mb-3 text-xs font-bold text-brand uppercase tracking-wider">
                  Step 03
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Finance Verification
                </h3>
                <p className="mt-2 text-sm text-muted-ink">
                  For payments above KES 50,000, finance officers conduct secondary verification
                  against treasury cash-flow balances.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div className="mb-3 text-xs font-bold text-brand uppercase tracking-wider">
                  Step 04
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Disburse & Reconcile
                </h3>
                <p className="mt-2 text-sm text-muted-ink">
                  Payment is executed through bank transfer or M-Pesa, logged with a provider
                  reference, and automatically marked settled in the audit log.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. By The Numbers (Reclaim Counter Section)
            ========================================================================= */}
        <section id="stats" className="border-t border-line py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Performance & Governance
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                By The Numbers
              </h2>
              <p className="mt-3 text-base text-muted-ink sm:text-lg">
                Measurable controls driving operational security across ImaraWorks projects.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-xs">
                <div className="font-serif text-4xl font-bold text-brand lg:text-5xl">
                  4
                </div>
                <h3 className="mt-2 text-sm font-semibold text-ink">
                  System Roles
                </h3>
                <p className="text-xs text-muted-ink mt-1">
                  Employee, Manager, Finance, Admin
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-xs">
                <div className="font-serif text-4xl font-bold text-brand lg:text-5xl">
                  KES 50k
                </div>
                <h3 className="mt-2 text-sm font-semibold text-ink">
                  Approval Limit Tier
                </h3>
                <p className="text-xs text-muted-ink mt-1">
                  Automated secondary routing
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-xs">
                <div className="font-serif text-4xl font-bold text-ok lg:text-5xl">
                  0%
                </div>
                <h3 className="mt-2 text-sm font-semibold text-ink">
                  Duplicate Payments
                </h3>
                <p className="text-xs text-muted-ink mt-1">
                  Automated invoice & vendor checking
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-xs">
                <div className="font-serif text-4xl font-bold text-brand lg:text-5xl">
                  100%
                </div>
                <h3 className="mt-2 text-sm font-semibold text-ink">
                  Audit Traceability
                </h3>
                <p className="text-xs text-muted-ink mt-1">
                  Immutable timestamped logs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. Role-Based Portals Overview
            ========================================================================= */}
        <section id="roles" className="border-t border-line bg-surface-subtle py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Role-Based Architecture
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Dedicated Workspaces for Every Team Member
              </h2>
              <p className="mt-3 text-base text-muted-ink sm:text-lg">
                One shared, secure platform where permissions determine what each user sees.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Role: Employee */}
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    Requester
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-bold text-ink">
                    Employee Portal
                  </h3>
                  <p className="mt-2 text-xs text-muted-ink leading-relaxed">
                    Submit invoices from job sites, select approved vendors, and monitor approval status in real-time.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                >
                  <span>Enter as Employee</span>
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              {/* Role: Manager */}
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    Department Lead
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-bold text-ink">
                    Manager Portal
                  </h3>
                  <p className="mt-2 text-xs text-muted-ink leading-relaxed">
                    Review and approve department requests up to KES 50,000 with reason tracking for rejections.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                >
                  <span>Enter as Manager</span>
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              {/* Role: Finance */}
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Treasury & Payouts
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-bold text-ink">
                    Finance Portal
                  </h3>
                  <p className="mt-2 text-xs text-muted-ink leading-relaxed">
                    Secondary authorization on large payouts, disbursement execution, and payment reconciliation.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                >
                  <span>Enter as Finance Officer</span>
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              {/* Role: Admin */}
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div>
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                    System Oversight
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-bold text-ink">
                    Admin Portal
                  </h3>
                  <p className="mt-2 text-xs text-muted-ink leading-relaxed">
                    User account governance, system-wide audit logs, vendor oversight, and compliance auditing.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                >
                  <span>Enter as Administrator</span>
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. Final CTA Banner
            ========================================================================= */}
        <section className="relative overflow-hidden border-t border-line bg-brand py-16 text-brand-foreground lg:py-20">
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Move Payments Forward.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-brand-light/90 sm:text-lg">
              Less chasing. More clarity. Better control for ImaraWorks Ltd.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-brand shadow-lg transition-transform hover:scale-102 hover:bg-slate-50"
              >
                <span>Get Started · Sign In</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          9. Footer
          ========================================================================= */}
      <footer className="border-t border-line bg-surface py-12 text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <span className="font-serif text-xl font-bold tracking-tight text-brand">
                PayWise
              </span>
              <p className="text-xs text-muted-ink leading-relaxed">
                Vendor payment requests, tiered approvals and disbursement tracking for ImaraWorks Ltd.
              </p>
              <p className="text-xs text-muted-ink">
                Nairobi, Kenya
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold text-ink">Navigation</h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-ink">
                <li><Link href="#home" className="hover:text-ink">Home</Link></li>
                <li><Link href="#pillars" className="hover:text-ink">Overview</Link></li>
                <li><Link href="#features" className="hover:text-ink">Key Features</Link></li>
                <li><Link href="#workflow" className="hover:text-ink">How It Works</Link></li>
                <li><Link href="#stats" className="hover:text-ink">By The Numbers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-bold text-ink">Portals</h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-ink">
                <li><Link href="/login" className="hover:text-ink">Employee Workspace</Link></li>
                <li><Link href="/login" className="hover:text-ink">Manager Approvals</Link></li>
                <li><Link href="/login" className="hover:text-ink">Finance Officer Portal</Link></li>
                <li><Link href="/login" className="hover:text-ink">Administrator Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-bold text-ink">Governance</h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-ink">
                <li>Dual Approval Threshold: KES 50,000</li>
                <li>Strict Role Segregation</li>
                <li>Tamper-Evident Audit Logging</li>
                <li>Automated Duplicate Detection</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-line pt-6 text-center text-xs text-muted-ink">
            © {new Date().getFullYear()} PayWise · ImaraWorks Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
