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
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* =========================================================================
          1. Header Navigation (Prominent Logo Size + White Canvas)
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo with Increased Size */}
          <Link href="/" className="flex items-center py-1 group">
            <Image
              src="/images/v4.png"
              alt="PayWise Logo"
              width={220}
              height={64}
              className="h-13 sm:h-16 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-600"
            >
              How It Works
            </Link>
            <Link
              href="#portals"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-600"
            >
              Portals
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-600"
            >
              Features
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-600"
            >
              Location
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-xs transition-all hover:bg-amber-400 hover:shadow-md hover:shadow-amber-500/20 active:scale-95"
            >
              <span>Sign In</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-3">
              <Link
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-amber-600"
              >
                How It Works
              </Link>
              <Link
                href="#portals"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-amber-600"
              >
                Portals
              </Link>
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-amber-600"
              >
                Features
              </Link>
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-amber-600"
              >
                Location
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950"
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
            2. Hero Section (Crystal Clear Sunrise Construction Desk Image)
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
            {/* Directional gradient: Dark on left for text readability, clear on right for desk/crane/sunrise */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.72) 42%, rgba(15, 23, 42, 0.25) 80%, rgba(15, 23, 42, 0.1) 100%)',
              }}
            />
            {/* Bottom transition to white canvas */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Hero Content — Minimal Information, Punchy & Clean */}
          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div className="max-w-2xl space-y-6 text-left">
              {/* Eyebrow Pill with Warm Yellowish/Amber Hue */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3.5 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-xs">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>Vendor Payment & Approval System</span>
              </div>

              {/* Main Headline: Bold Serif with Warm Yellowish Accent */}
              <div className="space-y-2">
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.12]">
                  Manage Vendor Payouts, <br />
                  <span className="font-light italic text-amber-300">
                    Without the Chaos.
                  </span>
                </h1>
              </div>

              {/* Concise Subtitle */}
              <p className="max-w-xl text-base sm:text-lg text-slate-200/90 leading-relaxed font-sans">
                PayWise centralizes vendor payment requests, dual-level approvals, and disbursement
                tracking into one clear, auditable workflow for ImaraWorks.
              </p>

              {/* Action Buttons with Yellowish / Amber Primary */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-500/35 active:scale-95"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40 active:scale-95"
                >
                  <span>See How It Works</span>
                </Link>
              </div>
            </div>
          </div>

          {/* "Scroll to Explore" indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 cursor-pointer text-amber-200/70 hover:text-amber-200 transition-colors duration-300">
            <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-amber-200/80">
              Scroll to Explore
            </span>
            <ChevronDown className="size-4 animate-bounce text-amber-300" />
          </div>
        </section>

        {/* =========================================================================
            3. How It Works (White Background with Amber Number Badges)
            ========================================================================= */}
        <section id="how-it-works" className="border-t border-slate-200/80 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600">
                How PayWise Works
              </span>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                A simple path from request to reconciled payment
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Clear governance that keeps project teams, managers, and finance perfectly aligned.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-amber-100 bg-amber-50/20 p-6 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300 bg-amber-100 font-mono text-xs font-bold text-amber-800">
                    01
                  </div>
                  <FileCheck2 className="size-5 text-amber-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-slate-900">Submit Request</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Employees initiate payment requests by selecting an approved vendor, specifying the
                  amount, and attaching invoice documents.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-amber-100 bg-amber-50/20 p-6 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300 bg-amber-100 font-mono text-xs font-bold text-amber-800">
                    02
                  </div>
                  <ShieldCheck className="size-5 text-amber-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-slate-900">Review & Authorize</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Department managers review validity. Requests exceeding KES 50,000 route automatically
                  to Finance for secondary authorization.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-amber-100 bg-amber-50/20 p-6 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300 bg-amber-100 font-mono text-xs font-bold text-amber-800">
                    03
                  </div>
                  <Receipt className="size-5 text-amber-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-slate-900">Disburse & Reconcile</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Finance executes payment, attaches transaction reference IDs, and updates the permanent,
                  immutable audit trail.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. Role Portals Access (Warm Cream & White Theme)
            ========================================================================= */}
        <section id="portals" className="border-t border-amber-100/80 bg-amber-50/30 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600">
                  Role-Based Workspaces
                </span>
                <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Dedicated portals for every team member
                </h2>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline"
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
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:border-amber-400 hover:shadow-md"
                >
                  <div>
                    <h3 className="font-serif text-base font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {item.role}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <span className="mt-5 text-xs font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
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
        <section id="features" className="border-t border-slate-200/80 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-amber-50/20 p-5 shadow-2xs">
                <CheckCircle2 className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-slate-900">KES 50,000 Threshold</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Dual-level governance for high-value construction disbursements.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-amber-50/20 p-5 shadow-2xs">
                <CheckCircle2 className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-slate-900">Duplicate Detection</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Automatic prevention of overlapping invoices and repeat payouts.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-amber-50/20 p-5 shadow-2xs">
                <CheckCircle2 className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-slate-900">100% Audit Trail</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Immutable timestamps and user attributions for every state change.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          6. Footer Resembling Reclaim EU Exactly (Structure, Stylings, Map, Icons)
          ========================================================================= */}
      <footer id="contact" className="w-full border-t border-slate-200 bg-linear-to-b from-white via-amber-50/15 to-amber-50/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Multi-column Grid (matching Reclaim EU 6-column layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-10 mb-12">
            {/* Column 1 & 2: Large Logo & Official Organization Info (md:col-span-2) */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/images/v4.png"
                  alt="PayWise Logo"
                  width={260}
                  height={80}
                  className="h-16 sm:h-18 w-auto max-w-70 object-contain"
                />
              </Link>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                PayWise by ImaraWorks Ltd is an enterprise payment request and tiered approval workflow
                platform for construction and infrastructure engineering. Centralizing vendor governance,
                dual-approval controls, and automated disbursement tracking.
              </p>
            </div>

            {/* Column 3: Project / Platform */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="#hero" className="text-sm text-slate-600 hover:text-amber-600 transition-colors">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-sm text-slate-600 hover:text-amber-600 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-sm text-slate-600 hover:text-amber-600 transition-colors">
                    Key Features
                  </Link>
                </li>
                <li>
                  <Link href="#portals" className="text-sm text-slate-600 hover:text-amber-600 transition-colors">
                    Portals
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Portals / Resources */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Portals</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/login?role=employee" className="text-sm text-slate-600 hover:text-amber-600 transition-colors">
                    Employee Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=manager" className="text-sm text-slate-600 hover:text-amber-600 transition-colors">
                    Manager Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=finance" className="text-sm text-slate-600 hover:text-amber-600 transition-colors">
                    Finance Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=admin" className="text-sm text-slate-600 hover:text-amber-600 transition-colors">
                    Admin Console
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Contact Stack (matching Reclaim rounded white icon boxes) */}
            <div className="xl:col-span-1">
              <h4 className="font-semibold text-slate-900 mb-4">Contact</h4>
              <div className="space-y-3">
                {/* Email Us */}
                <div className="flex items-start gap-3 text-sm text-slate-600 hover:text-amber-600 transition-colors">
                  <div className="border border-amber-500/40 rounded-lg p-2 bg-white shadow-2xs shrink-0">
                    <Mail className="size-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Email Us</p>
                    <a
                      className="text-xs text-amber-600 hover:underline break-all"
                      href="mailto:payments@imaraworks.com"
                    >
                      payments@imaraworks.com
                    </a>
                  </div>
                </div>

                {/* Call Us */}
                <div className="flex items-start gap-3 text-sm text-slate-600 hover:text-amber-600 transition-colors">
                  <div className="border border-amber-500/40 rounded-lg p-2 bg-white shadow-2xs shrink-0">
                    <Phone className="size-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Call Us</p>
                    <a className="text-xs text-amber-600 hover:underline" href="tel:+254700123456">
                      +254 700 123 456
                    </a>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="border border-amber-500/40 rounded-lg p-2 bg-white shadow-2xs shrink-0">
                    <Clock className="size-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Office Hours</p>
                    <p className="text-xs text-slate-600">08:00 – 17:00 EAT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 6: Location & Interactive Map (matching Reclaim's Location) */}
            <div className="xl:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="size-4 text-amber-600" />
                  <span>Location</span>
                </h4>
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  Nairobi
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-2 leading-tight">
                ImaraWorks Tower, Upper Hill, Nairobi, Kenya
              </p>
              {/* Google Map Embedded Card */}
              <div className="overflow-hidden rounded-xl border border-slate-200/90 shadow-2xs h-36 w-full">
                <iframe
                  title="Headquarters Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.814321956123!2d36.8155!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10dfb9e4a3b1%3A0x7d6b38c29b71e16a!2sUpper%20Hill%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Bottom Bar (Exact Reclaim structure) */}
          <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 PayWise (ImaraWorks Ltd). All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span>System Status: All services operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
