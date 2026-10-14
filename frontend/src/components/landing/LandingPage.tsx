'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Menu,
  X,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased selection:bg-brand/15 selection:text-brand-deep">
      {/* =========================================================================
          1. Clean Header Navigation
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-line bg-canvas/95 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo.png"
              alt="PayWise Logo"
              width={34}
              height={34}
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="font-serif text-xl font-bold tracking-tight text-ink">
              Pay<span className="text-brand">Wise</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-ink transition-colors hover:text-ink"
            >
              Features
            </Link>
            <Link
              href="#workflow"
              className="text-sm font-medium text-muted-ink transition-colors hover:text-ink"
            >
              How It Works
            </Link>
            <Link
              href="#portals"
              className="text-sm font-medium text-muted-ink transition-colors hover:text-ink"
            >
              Portals
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-xs transition-colors hover:bg-brand-deep"
            >
              <span>Sign In</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid size-9 place-items-center rounded-lg border border-line text-ink hover:bg-surface md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-line bg-surface px-4 py-4 md:hidden">
            <div className="flex flex-col space-y-3">
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-ink hover:text-ink"
              >
                Features
              </Link>
              <Link
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-ink hover:text-ink"
              >
                How It Works
              </Link>
              <Link
                href="#portals"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-ink hover:text-ink"
              >
                Portals
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
              >
                <span>Sign In</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* =========================================================================
            2. Hero Section (Clear Sunrise Construction Planning Desk Image)
            ========================================================================= */}
        <section
          id="hero"
          className="relative flex min-h-[88vh] items-center overflow-hidden py-12 lg:py-20"
        >
          {/* Background image: Crystal clear, no heavy dark/gray fog */}
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
            {/* Subtle soft gradient only at the top and base for seamless edges */}
            <div className="absolute inset-0 bg-linear-to-b from-canvas/40 via-transparent to-canvas/70 pointer-events-none" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Frosted Glassmorphic Editorial Card ensuring 100% crisp text readability while keeping the entire image clear */}
            <div className="max-w-xl rounded-3xl border border-white/80 bg-white/85 p-7 shadow-2xl backdrop-blur-md sm:p-10">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-deep">
                <Sparkles className="size-3 text-brand" />
                <span>Vendor Payment & Approval System</span>
              </div>

              {/* Main Headline with refined editorial serif font */}
              <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl leading-[1.15]">
                Payments, built for construction and clarity.
              </h1>

              {/* Subheading */}
              <p className="mt-4 text-base text-ink-secondary leading-relaxed sm:text-lg">
                PayWise simplifies vendor payment requests, dual-level approvals, and disbursement
                tracking into one clear, auditable workflow for ImaraWorks.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-md transition-all hover:bg-brand-deep hover:shadow-lg active:scale-[0.99]"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="#workflow"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface/90 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
                >
                  <span>How It Works</span>
                </Link>
              </div>

              {/* Simple 3 Key Metrics */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-6">
                <div>
                  <div className="font-serif text-xl font-bold text-brand sm:text-2xl">KES 50K</div>
                  <div className="text-xs text-muted-ink">Dual-approval tier</div>
                </div>
                <div>
                  <div className="font-serif text-xl font-bold text-brand sm:text-2xl">4 Roles</div>
                  <div className="text-xs text-muted-ink">Segregated access</div>
                </div>
                <div>
                  <div className="font-serif text-xl font-bold text-ok sm:text-2xl">100%</div>
                  <div className="text-xs text-muted-ink">Traceable audit logs</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. Core Features (3 Clean Cards)
            ========================================================================= */}
        <section id="features" className="border-t border-line bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Everything you need to manage vendor payouts.
              </h2>
              <p className="mt-2 text-sm text-ink-secondary sm:text-base">
                Eliminate lost invoices, delayed approvals, and duplicate payments with a single
                connected workflow.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <div className="rounded-2xl border border-line bg-canvas p-6 shadow-2xs transition-shadow hover:shadow-sm">
                <div className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                  <FileText className="size-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-ink">Structured Requests</h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Submit requests directly against registered vendors with automated invoice validation
                  and built-in duplicate detection.
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-line bg-canvas p-6 shadow-2xs transition-shadow hover:shadow-sm">
                <div className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-ink">Tiered Approvals</h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Manager approvals for everyday operational expenses, plus mandatory Finance review
                  for high-value payments exceeding KES 50,000.
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-line bg-canvas p-6 shadow-2xs transition-shadow hover:shadow-sm">
                <div className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Clock className="size-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-ink">Disbursement & Audit</h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Track payment states from initiation to settlement with provider reference codes and
                  an immutable event audit log.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. Simple Workflow (3 Clear Steps)
            ========================================================================= */}
        <section id="workflow" className="border-t border-line bg-canvas py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                How It Works
              </h2>
              <p className="mt-2 text-sm text-ink-secondary">
                A streamlined three-step path from request to reconciled payment.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand">
                    Step 01
                  </span>
                  <CheckCircle2 className="size-4 text-brand" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">Submit Request</h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Employees initiate payment requests by selecting an approved vendor, specifying the
                  amount, and attaching invoice documents.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand">
                    Step 02
                  </span>
                  <CheckCircle2 className="size-4 text-brand" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">Review & Authorize</h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Managers review project validity. Requests exceeding KES 50,000 route automatically to
                  Finance for secondary review.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand">
                    Step 03
                  </span>
                  <CheckCircle2 className="size-4 text-brand" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">Disburse & Reconcile</h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Finance processes the disbursement, updates provider transaction references, and logs
                  the completion to the audit trail.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. Role Portals Access
            ========================================================================= */}
        <section id="portals" className="border-t border-line bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Role-Based Portals
                </h2>
                <p className="mt-1 text-sm text-ink-secondary">
                  Choose your role to sign in to your dedicated workspace.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                <span>Go to general sign in</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  role: 'Employee Portal',
                  desc: 'Submit requests, track approvals, and view approved vendors.',
                  url: '/login?role=employee',
                },
                {
                  role: 'Manager Portal',
                  desc: 'Review team submissions, approve line items, or request revisions.',
                  url: '/login?role=manager',
                },
                {
                  role: 'Finance Portal',
                  desc: 'Disburse funds, manage payment batches, and reconcile accounts.',
                  url: '/login?role=finance',
                },
                {
                  role: 'Admin Portal',
                  desc: 'Manage users, set system configurations, and inspect audit logs.',
                  url: '/login?role=admin',
                },
              ].map((item) => (
                <Link
                  key={item.role}
                  href={item.url}
                  className="group flex flex-col justify-between rounded-2xl border border-line bg-canvas p-5 transition-all hover:border-brand/40 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-ink group-hover:text-brand">{item.role}</h3>
                      <ArrowUpRight className="size-4 text-muted-ink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
                    </div>
                    <p className="mt-2 text-xs text-muted-ink leading-relaxed">{item.desc}</p>
                  </div>
                  <span className="mt-4 text-xs font-semibold text-brand">Sign In &rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          6. Minimal Footer
          ========================================================================= */}
      <footer className="border-t border-line bg-canvas py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-semibold text-ink">PayWise</span>
            <span className="text-xs text-muted-ink">· ImaraWorks Ltd © 2026</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-ink">
            <Link href="#features" className="hover:text-ink">
              Features
            </Link>
            <Link href="#workflow" className="hover:text-ink">
              Workflow
            </Link>
            <Link href="#portals" className="hover:text-ink">
              Portals
            </Link>
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
