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
  Mail,
  Phone,
  Clock,
  MapPin,
} from 'lucide-react';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased selection:bg-blue-600 selection:text-white">
      {/* =========================================================================
          1. Header Navigation with Official v4 Logo
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-line bg-canvas/95 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo with v4.png */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/v4.png"
              alt="PayWise Logo"
              width={160}
              height={44}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#how-it-works"
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
              href="#features"
              className="text-sm font-medium text-muted-ink transition-colors hover:text-ink"
            >
              Features
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-muted-ink transition-colors hover:text-ink"
            >
              Location
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-95"
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
          <div className="border-b border-line bg-surface px-4 py-4 md:hidden animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-3">
              <Link
                href="#how-it-works"
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
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-ink hover:text-ink"
              >
                Features
              </Link>
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-ink hover:text-ink"
              >
                Location
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
               Modeled after mytravel-two.vercel.app
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
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

              {/* Concise Subtitle */}
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

          {/* "Scroll to Explore" indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 cursor-pointer text-slate-400 hover:text-white transition-colors duration-300">
            <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-slate-400">
              Scroll to Explore
            </span>
            <ChevronDown className="size-4 animate-bounce text-slate-400" />
          </div>
        </section>

        {/* =========================================================================
            3. How It Works (Clean 3-Step Timeline)
            ========================================================================= */}
        <section id="how-it-works" className="border-t border-line bg-surface py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600">
                How PayWise Works
              </span>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                A simple path from request to reconciled payment
              </h2>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
                Clear governance that keeps project teams, managers, and finance perfectly aligned.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-line bg-canvas p-6 shadow-2xs transition-all hover:border-blue-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-50 font-mono text-xs font-bold text-blue-600">
                    01
                  </div>
                  <FileCheck2 className="size-5 text-blue-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-ink">Submit Request</h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Employees initiate payment requests by selecting an approved vendor, specifying the
                  amount, and attaching invoice documents.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-line bg-canvas p-6 shadow-2xs transition-all hover:border-blue-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-50 font-mono text-xs font-bold text-blue-600">
                    02
                  </div>
                  <ShieldCheck className="size-5 text-blue-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-ink">Review & Authorize</h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Department managers review validity. Requests exceeding KES 50,000 route automatically
                  to Finance for secondary authorization.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-line bg-canvas p-6 shadow-2xs transition-all hover:border-blue-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-50 font-mono text-xs font-bold text-blue-600">
                    03
                  </div>
                  <Receipt className="size-5 text-blue-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-ink">Disburse & Reconcile</h3>
                <p className="mt-2 text-sm text-muted-ink leading-relaxed">
                  Finance executes payment, attaches transaction reference IDs, and updates the permanent,
                  immutable audit trail.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. Role Portals Access
            ========================================================================= */}
        <section id="portals" className="border-t border-line bg-canvas py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600">
                  Role-Based Workspaces
                </span>
                <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  Dedicated portals for every team member
                </h2>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
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
                  className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-2xs transition-all hover:border-blue-500/50 hover:shadow-md"
                >
                  <div>
                    <h3 className="font-serif text-base font-semibold text-ink group-hover:text-blue-600 transition-colors">
                      {item.role}
                    </h3>
                    <p className="mt-2 text-xs text-muted-ink leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <span className="mt-5 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    <span>Access Portal</span>
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. Core Highlights Row
            ========================================================================= */}
        <section id="features" className="border-t border-line bg-surface py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-start gap-4 rounded-xl border border-line bg-canvas p-5 shadow-2xs">
                <CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-ink">KES 50,000 Threshold</div>
                  <div className="text-xs text-muted-ink mt-1">
                    Dual-level governance for high-value construction disbursements.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-line bg-canvas p-5 shadow-2xs">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-ink">Duplicate Detection</div>
                  <div className="text-xs text-muted-ink mt-1">
                    Automatic prevention of overlapping invoices and repeat payouts.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-line bg-canvas p-5 shadow-2xs">
                <CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-ink">100% Audit Trail</div>
                  <div className="text-xs text-muted-ink mt-1">
                    Immutable timestamps and user attributions for every state change.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          6. Footer Inspired by Reclaim EU (with Interactive Location Maps)
          ========================================================================= */}
      <footer id="contact" className="border-t border-slate-800 bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 mb-12">
            {/* Column 1: Brand & Overview (4 cols) */}
            <div className="space-y-4 lg:col-span-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-white p-1.5 shadow-sm inline-block">
                  <Image
                    src="/images/v4.png"
                    alt="PayWise Logo"
                    width={150}
                    height={40}
                    className="h-9 w-auto object-contain"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                PayWise is the enterprise vendor payment request and tiered approval management system
                tailored for ImaraWorks Ltd construction and infrastructure engineering projects.
              </p>

              {/* Contact Information Cards like Reclaim */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="rounded-lg border border-white/10 bg-slate-900 p-2 text-blue-400 shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Email Us</p>
                    <a
                      href="mailto:payments@imaraworks.com"
                      className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      payments@imaraworks.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="rounded-lg border border-white/10 bg-slate-900 p-2 text-blue-400 shrink-0">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Call Us</p>
                    <span className="text-xs text-slate-400">+254 700 123 456</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="rounded-lg border border-white/10 bg-slate-900 p-2 text-blue-400 shrink-0">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Office Hours</p>
                    <span className="text-xs text-slate-400">Mon – Fri, 08:00 – 17:00 (EAT)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-white">
                Platform
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <Link href="#hero" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#portals" className="hover:text-white transition-colors">
                    Role Portals
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Key Features
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Portals (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-white">
                Portals
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <Link href="/login?role=employee" className="hover:text-white transition-colors">
                    Employee Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=manager" className="hover:text-white transition-colors">
                    Manager Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=finance" className="hover:text-white transition-colors">
                    Finance Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=admin" className="hover:text-white transition-colors">
                    Administrator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Interactive Location Map (4 cols) like Reclaim */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <MapPin className="size-4 text-blue-400" />
                  <span>Headquarters & Operations</span>
                </h4>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300">
                  Nairobi, Kenya
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ImaraWorks Tower, Upper Hill Commercial District, Nairobi, Kenya
              </p>

              {/* Embedded Google Map */}
              <div className="relative w-full h-44 overflow-hidden rounded-xl border border-white/10 shadow-md">
                <iframe
                  title="ImaraWorks Headquarters Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.814321956123!2d36.8155!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10dfb9e4a3b1%3A0x7d6b38c29b71e16a!2sUpper%20Hill%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale-[25%] contrast-110"
                />
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 PayWise · ImaraWorks Ltd. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Status: All services operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
