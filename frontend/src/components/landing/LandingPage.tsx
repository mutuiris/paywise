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
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* =========================================================================
          1. Header Navigation (Reclaim Style: Clean White & Primary Blue)
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo with v4-clean transparent logo */}
          <Link href="/" className="flex items-center py-1 group">
            <Image
              src="/images/v4-clean.png"
              alt="PayWise Logo"
              width={200}
              height={55}
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              How It Works
            </Link>
            <Link
              href="#portals"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Portals
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Features
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Location
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 active:scale-95"
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
                className="text-sm font-medium text-slate-700 hover:text-blue-600"
              >
                How It Works
              </Link>
              <Link
                href="#portals"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-blue-600"
              >
                Portals
              </Link>
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-blue-600"
              >
                Features
              </Link>
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-blue-600"
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
            2. Hero Section (Centered Content + Warm Yellowish Sunrise Layer)
            ========================================================================= */}
        <section
          id="hero"
          className="relative flex min-h-[90vh] sm:min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-24"
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
            {/* Warm Yellowish / Amber Sunrise Layer (Replacing bluish tone) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(245, 158, 11, 0.4) 0%, rgba(180, 83, 9, 0.6) 45%, rgba(69, 26, 3, 0.88) 100%)',
              }}
            />
            {/* Soft radial golden glow around center text */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(254, 240, 138, 0.22) 0%, rgba(217, 119, 6, 0.35) 60%, rgba(30, 20, 10, 0.65) 100%)',
              }}
            />
            {/* Smooth bottom transition to pure white canvas */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-95 pointer-events-none" />
          </div>

          {/* Centered Hero Content */}
          <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
            <div className="flex flex-col items-center space-y-6">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-500/25 px-4 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-amber-100 backdrop-blur-md shadow-sm">
                <Sparkles className="size-3.5 text-amber-300" />
                <span>Vendor Payment & Approval System</span>
              </div>

              {/* Main Headline (Centered with Refined Editorial Font) */}
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12] drop-shadow-md">
                Manage Vendor Payouts, <br />
                <span className="font-light italic text-amber-200">
                  Without the Chaos.
                </span>
              </h1>

              {/* Concise Subtitle (Centered) */}
              <p className="max-w-2xl text-base sm:text-lg text-amber-50/95 leading-relaxed font-sans drop-shadow-xs">
                PayWise centralizes vendor payment requests, dual-level approvals, and disbursement
                tracking into one clear, auditable workflow for ImaraWorks.
              </p>

              {/* Centered Action Buttons (Primary Blue + Frosted White) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full sm:w-auto">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-900/40 transition-all hover:bg-blue-700 hover:shadow-blue-900/60 active:scale-95 w-full sm:w-auto"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/20 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 hover:border-white/70 active:scale-95 w-full sm:w-auto"
                >
                  <span>See How It Works</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bouncing Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 cursor-pointer text-amber-100/80 hover:text-white transition-colors duration-300">
            <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-amber-100/90">
              Scroll to Explore
            </span>
            <ChevronDown className="size-4 animate-bounce text-amber-200" />
          </div>
        </section>

        {/* =========================================================================
            3. How It Works (White Background + Primary Blue Accents)
            ========================================================================= */}
        <section id="how-it-works" className="border-t border-slate-200/80 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600">
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
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/40 p-6 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-blue-50 font-mono text-xs font-bold text-blue-700">
                    01
                  </div>
                  <FileCheck2 className="size-5 text-blue-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-slate-900">Submit Request</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Employees initiate payment requests by selecting an approved vendor, specifying the
                  amount, and attaching invoice documents.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/40 p-6 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-blue-50 font-mono text-xs font-bold text-blue-700">
                    02
                  </div>
                  <ShieldCheck className="size-5 text-blue-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-slate-900">Review & Authorize</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Department managers review validity. Requests exceeding KES 50,000 route automatically
                  to Finance for secondary authorization.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/40 p-6 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-blue-50 font-mono text-xs font-bold text-blue-700">
                    03
                  </div>
                  <Receipt className="size-5 text-blue-600" />
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
            4. Role Portals Access (White Canvas + Clean Blue Accent)
            ========================================================================= */}
        <section id="portals" className="border-t border-slate-200 bg-slate-50/60 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600">
                  Role-Based Workspaces
                </span>
                <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
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
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:border-blue-400 hover:shadow-md"
                >
                  <div>
                    <h3 className="font-serif text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.role}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <span className="mt-5 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
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
        <section id="features" className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 shadow-2xs">
                <CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-slate-900">KES 50,000 Threshold</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Dual-level governance for high-value construction disbursements.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 shadow-2xs">
                <CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-lg font-bold text-slate-900">Duplicate Detection</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Automatic prevention of overlapping invoices and repeat payouts.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 shadow-2xs">
                <CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
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
          6. Footer Resembling Reclaim EU Exactly (White Canvas, Blue Accents, Maps)
          ========================================================================= */}
      <footer id="contact" className="w-full border-t border-slate-200 bg-linear-to-b from-white via-slate-50/30 to-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Multi-column Grid (matching Reclaim EU 6-column layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-10 mb-12">
            {/* Column 1 & 2: Large Logo & Official Organization Info (md:col-span-2) */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/images/v4-clean.png"
                  alt="PayWise Logo"
                  width={240}
                  height={65}
                  className="h-14 sm:h-16 w-auto max-w-70 object-contain"
                />
              </Link>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                PayWise by ImaraWorks Ltd is an enterprise payment request and tiered approval workflow
                platform for construction and infrastructure engineering. Centralizing vendor governance,
                dual-approval controls, and automated disbursement tracking.
              </p>
            </div>

            {/* Column 3: Platform */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="#hero" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Key Features
                  </Link>
                </li>
                <li>
                  <Link href="#portals" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Portals
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Portals */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Portals</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/login?role=employee" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Employee Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=manager" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Manager Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=finance" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    Finance Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=admin" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
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
                <div className="flex items-start gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                  <div className="border border-blue-500/30 rounded-lg p-2 bg-white shadow-2xs shrink-0">
                    <Mail className="size-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Email Us</p>
                    <a
                      className="text-xs text-blue-600 hover:underline break-all"
                      href="mailto:payments@imaraworks.com"
                    >
                      payments@imaraworks.com
                    </a>
                  </div>
                </div>

                {/* Call Us */}
                <div className="flex items-start gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                  <div className="border border-blue-500/30 rounded-lg p-2 bg-white shadow-2xs shrink-0">
                    <Phone className="size-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Call Us</p>
                    <a className="text-xs text-blue-600 hover:underline" href="tel:+254700123456">
                      +254 700 123 456
                    </a>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="border border-blue-500/30 rounded-lg p-2 bg-white shadow-2xs shrink-0">
                    <Clock className="size-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Office Hours</p>
                    <p className="text-xs text-slate-600">08:00 – 17:00 EAT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 6: Location & Interactive Map (matching Reclaim) */}
            <div className="xl:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="size-4 text-blue-600" />
                  <span>Location</span>
                </h4>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
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
              <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
              <span>System Status: All services operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
