'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  FileCheck2,
  Receipt,
  Mail,
  Phone,
  Clock,
  MapPin,
  CreditCard,
  Activity,
  CopyCheck,
  History,
  BarChart3,
} from 'lucide-react';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-serif text-slate-900 antialiased selection:bg-[#004aad] selection:text-white">
      {/* =========================================================================
          1. Header Navigation (Reclaim Style: Clean White & PayWise Logo Blue)
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo (Left) */}
          <Link href="/" className="flex items-center py-1 group shrink-0">
            <Image
              src="/images/logo.png"
              alt="PayWise Logo"
              width={160}
              height={48}
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          </Link>

          {/* Desktop Nav Links (Centered) */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 font-serif">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#004aad]"
            >
              How It Works
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#004aad]"
            >
              Features
            </Link>
            <Link
              href="#location"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#004aad]"
            >
              Location
            </Link>
          </div>

          {/* Desktop CTA / Mobile Menu Trigger (Right) */}
          <div className="flex items-center gap-2.5 font-serif">
            <Link
              href="#contact"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:border-[#004aad]/50 hover:text-[#004aad] hover:bg-[#eef5fc]/60 active:scale-95"
            >
              <Phone className="size-3.5 text-[#004aad]" />
              <span>Contact</span>
            </Link>
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-[#004aad] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#004aad]/20 transition-all hover:bg-[#003887] hover:shadow-md hover:shadow-[#004aad]/30 active:scale-95"
            >
              <span>Sign In</span>
              <ArrowRight className="size-3.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden animate-in slide-in-from-top-2 font-serif">
            <div className="flex flex-col space-y-3">
              <Link
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-[#004aad]"
              >
                How It Works
              </Link>
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-[#004aad]"
              >
                Features
              </Link>
              <Link
                href="#location"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-[#004aad]"
              >
                Location
              </Link>
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-[#004aad] flex items-center gap-1.5"
              >
                <Phone className="size-3.5 text-[#004aad]" />
                <span>Contact</span>
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#004aad] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003887]"
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
            2. Hero Section (Whitish Ambient Wash on Architectural Background, No Eyebrows)
            ========================================================================= */}
        <section
          id="hero"
          className="relative flex min-h-[80vh] sm:min-h-[84vh] lg:min-h-[88vh] items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 border-b border-slate-200"
        >
          {/* Background Image: Architectural Hero Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-bg.jpg"
              alt="PayWise Architecture & Engineering Platform"
              fill
              priority
              quality={95}
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Ambient whitish wash */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.68) 50%, rgba(255, 255, 255, 0.30) 85%, rgba(255, 255, 255, 0.15) 100%)',
              }}
            />
          </div>

          {/* Hero Content — Perfectly Centered, Lora Typography Everywhere, No Eyebrow */}
          <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5">
              {/* Main Headline */}
              <div className="space-y-2.5 sm:space-y-3 max-w-3xl mx-auto">
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.14]">
                  Manage Vendor Payouts, <br />
                  <span className="font-light italic bg-gradient-to-r from-[#004aad] via-[#005cd4] to-[#1d4ed8] bg-clip-text text-transparent">
                    Without the Chaos.
                  </span>
                </h1>
                <p className="mt-2.5 text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto font-serif">
                  PayWise centralizes vendor payment requests, dual-level approvals, and disbursement
                  tracking into one clear, auditable workflow for ImaraWorks.
                </p>
              </div>

              {/* Centered Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1.5 w-full sm:w-auto font-serif">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#004aad] hover:bg-[#003887] text-white font-semibold text-sm shadow-md shadow-[#004aad]/25 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group whitespace-nowrap"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform text-white" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-xs whitespace-nowrap group hover:border-[#004aad]/40 backdrop-blur-sm"
                >
                  <span>See How It Works</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform text-[#004aad]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Cue */}
          <Link
            href="#how-it-works"
            className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-0.5 cursor-pointer text-[#004aad] hover:text-[#003887] transition-colors duration-300 font-serif"
          >
            <span className="text-[10px] font-serif font-bold tracking-wider text-[#004aad]">
              Scroll
            </span>
            <ChevronDown className="size-3.5 animate-bounce text-[#004aad]" />
          </Link>
        </section>

        {/* =========================================================================
            3. How It Works (Exact 3-Step Workflow, No Eyebrows, Lora Font)
            ========================================================================= */}
        <section id="how-it-works" className="border-t border-slate-200/80 bg-white py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                How It Works
              </h2>
              <p className="font-serif text-xs sm:text-sm text-slate-600 leading-relaxed">
                From request to completion, every payment stays transparent, traceable, and aligned across teams.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Step 1: Submit Request */}
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5 shadow-2xs transition-all hover:border-[#004aad]/40 hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#004aad]/30 bg-[#eef5fc] font-serif text-xs font-bold text-[#004aad]">
                    01
                  </div>
                  <FileCheck2 className="size-4.5 text-[#004aad]" />
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-900">Submit Request</h3>
                <p className="font-serif mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Submit vendor payment details and invoices.
                </p>
              </div>

              {/* Step 2: Review & Approve */}
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5 shadow-2xs transition-all hover:border-[#004aad]/40 hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#004aad]/30 bg-[#eef5fc] font-serif text-xs font-bold text-[#004aad]">
                    02
                  </div>
                  <ShieldCheck className="size-4.5 text-[#004aad]" />
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-900">Review & Approve</h3>
                <p className="font-serif mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Managers and Finance approve requests based on payment limits.
                </p>
              </div>

              {/* Step 3: Pay & Reconcile */}
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5 shadow-2xs transition-all hover:border-[#004aad]/40 hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#004aad]/30 bg-[#eef5fc] font-serif text-xs font-bold text-[#004aad]">
                    03
                  </div>
                  <Receipt className="size-4.5 text-[#004aad]" />
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-900">Pay & Reconcile</h3>
                <p className="font-serif mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Finance processes payments and records transaction details.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. Features Section (Exact 6 Modules, No Eyebrows, Lora Font)
            ========================================================================= */}
        <section id="features" className="border-y border-slate-200 bg-[#f8fafc] py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-2 mb-8 sm:mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                Features
              </h2>
              <p className="font-serif text-xs sm:text-sm text-slate-600 leading-relaxed">
                Six powerful modules for transparent, precise, and efficient payment management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Card 1: Payment Requests */}
              <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#004aad]/40 hover:shadow-md">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#004aad]/10 via-[#004aad]/5 to-teal-500/10 border border-[#004aad]/15 text-[#004aad] group-hover:scale-105 group-hover:border-teal-500/30 transition-all duration-300">
                    <CreditCard className="size-4.5 text-[#004aad] group-hover:text-teal-600 transition-colors" />
                  </div>
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-900 group-hover:text-[#004aad] transition-colors">
                  Payment Requests
                </h3>
                <p className="font-serif mt-1.5 text-xs sm:text-sm text-slate-600 leading-normal">
                  Submit vendor invoices quickly and easily.
                </p>
              </div>

              {/* Card 2: Smart Approvals */}
              <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#004aad]/40 hover:shadow-md">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#004aad]/10 via-[#004aad]/5 to-teal-500/10 border border-[#004aad]/15 text-[#004aad] group-hover:scale-105 group-hover:border-teal-500/30 transition-all duration-300">
                    <ShieldCheck className="size-4.5 text-[#004aad] group-hover:text-teal-600 transition-colors" />
                  </div>
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-900 group-hover:text-[#004aad] transition-colors">
                  Smart Approvals
                </h3>
                <p className="font-serif mt-1.5 text-xs sm:text-sm text-slate-600 leading-normal">
                  Automate approvals based on payment amounts.
                </p>
              </div>

              {/* Card 3: Payment Tracking */}
              <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#004aad]/40 hover:shadow-lg">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#004aad]/10 via-[#004aad]/5 to-teal-500/10 border border-[#004aad]/15 text-[#004aad] group-hover:scale-105 group-hover:border-teal-500/30 transition-all duration-300">
                    <Activity className="size-4.5 text-[#004aad] group-hover:text-teal-600 transition-colors" />
                  </div>
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-900 group-hover:text-[#004aad] transition-colors">
                  Payment Tracking
                </h3>
                <p className="font-serif mt-1.5 text-xs sm:text-sm text-slate-600 leading-normal">
                  Track every payment from request to completion.
                </p>
              </div>

              {/* Card 4: Duplicate Protection */}
              <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#004aad]/40 hover:shadow-md">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#004aad]/10 via-[#004aad]/5 to-teal-500/10 border border-[#004aad]/15 text-[#004aad] group-hover:scale-105 group-hover:border-teal-500/30 transition-all duration-300">
                    <CopyCheck className="size-4.5 text-[#004aad] group-hover:text-teal-600 transition-colors" />
                  </div>
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-900 group-hover:text-[#004aad] transition-colors">
                  Duplicate Protection
                </h3>
                <p className="font-serif mt-1.5 text-xs sm:text-sm text-slate-600 leading-normal">
                  Prevent duplicate invoices and payments.
                </p>
              </div>

              {/* Card 5: Audit Trail */}
              <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#004aad]/40 hover:shadow-md">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#004aad]/10 via-[#004aad]/5 to-teal-500/10 border border-[#004aad]/15 text-[#004aad] group-hover:scale-105 group-hover:border-teal-500/30 transition-all duration-300">
                    <History className="size-4.5 text-[#004aad] group-hover:text-teal-600 transition-colors" />
                  </div>
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-900 group-hover:text-[#004aad] transition-colors">
                  Audit Trail
                </h3>
                <p className="font-serif mt-1.5 text-xs sm:text-sm text-slate-600 leading-normal">
                  Record every action, approval and change.
                </p>
              </div>

              {/* Card 6: Reports */}
              <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#004aad]/40 hover:shadow-md">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#004aad]/10 via-[#004aad]/5 to-teal-500/10 border border-[#004aad]/15 text-[#004aad] group-hover:scale-105 group-hover:border-teal-500/30 transition-all duration-300">
                    <BarChart3 className="size-4.5 text-[#004aad] group-hover:text-teal-600 transition-colors" />
                  </div>
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-900 group-hover:text-[#004aad] transition-colors">
                  Reports
                </h3>
                <p className="font-serif mt-1.5 text-xs sm:text-sm text-slate-600 leading-normal">
                  View payment activity and reconciliation reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. Our Location Section (No Eyebrows, Lora Font)
            ========================================================================= */}
        <section id="location" className="border-t border-slate-200 bg-white py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-2 mb-6 sm:mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                Location
              </h2>
              <p className="font-serif text-xs sm:text-sm text-slate-600 leading-relaxed">
                Proudly built in Kenya to power fast, transparent payments for businesses across Kenya.
              </p>
            </div>

            {/* Clean Interactive Map Visual */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-md bg-slate-50 h-[280px] sm:h-[320px] lg:h-[340px] w-full max-w-5xl mx-auto group">
              <iframe
                title="PayWise ImaraWorks Headquarters Nairobi Kenya"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.814321956123!2d36.8155!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10dfb9e4a3b1%3A0x7d6b38c29b71e16a!2sUpper%20Hill%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
              {/* Floating Glassmorphic Location Badge (Top Right) */}
              <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-md flex items-center gap-2 sm:gap-2.5 pointer-events-none font-serif">
                <div className="relative flex size-8 sm:size-9 items-center justify-center rounded-lg bg-teal-50 border border-teal-200/80 text-teal-700 shrink-0">
                  <MapPin className="size-4 sm:size-4.5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 font-serif">ImaraWorks Tower</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-serif">Upper Hill · Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          6. Footer with Reclaim EU World Map Background & Clean Styling
          ========================================================================= */}
      <footer
        id="contact"
        className="w-full bg-white bg-[url('/images/footer.webp')] bg-cover bg-no-repeat bg-center border-t border-slate-200 text-slate-800 font-serif"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 mb-8">
            {/* Column 1: Brand & Overview (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-3">
              <Link href="/" className="inline-block">
                <Image
                  src="/images/logo.png"
                  alt="PayWise Logo"
                  width={180}
                  height={50}
                  className="h-9 sm:h-10 w-auto object-contain"
                />
              </Link>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md font-serif">
                PayWise is an enterprise payment request and tiered approval workflow
                platform for construction and infrastructure engineering. Centralizing dual-level approvals,
                audit governance, and automated disbursements.
              </p>
            </div>

            {/* Column 2: Platform Links (lg:col-span-3 lg:col-start-7) */}
            <div className="lg:col-span-3 lg:col-start-7">
              <h4 className="font-semibold text-slate-900 mb-3 text-sm tracking-wide font-serif">Platform</h4>
              <ul className="space-y-2 text-xs sm:text-sm font-serif">
                <li>
                  <Link href="#hero" className="text-slate-600 hover:text-[#004aad] transition-colors">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-slate-600 hover:text-[#004aad] transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-slate-600 hover:text-[#004aad] transition-colors">
                    Key Features
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-[#004aad] font-medium hover:text-[#003887] transition-colors inline-flex items-center gap-1">
                    <span>Sign In to Portal</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Hours (lg:col-span-3) */}
            <div className="lg:col-span-3">
              <h4 className="font-semibold text-slate-900 mb-3 text-sm tracking-wide font-serif">Contact</h4>
              <div className="space-y-2.5 font-serif">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 hover:text-[#004aad] transition-colors">
                  <div className="border border-[#004aad]/30 rounded-lg p-1.5 bg-white shadow-2xs shrink-0">
                    <Mail className="size-3.5 text-[#004aad]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 font-serif">Email Us</p>
                    <a className="text-xs text-[#004aad] hover:underline break-all font-serif" href="mailto:payments@imaraworks.com">
                      payments@imaraworks.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 hover:text-[#004aad] transition-colors">
                  <div className="border border-[#004aad]/30 rounded-lg p-1.5 bg-white shadow-2xs shrink-0">
                    <Phone className="size-3.5 text-[#004aad]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 font-serif">Call Us</p>
                    <a className="text-xs text-[#004aad] hover:underline font-serif" href="tel:+254700123456">
                      +254 700 123 456
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                  <div className="border border-[#004aad]/30 rounded-lg p-1.5 bg-white shadow-2xs shrink-0">
                    <Clock className="size-3.5 text-[#004aad]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 font-serif">Office Hours</p>
                    <p className="text-xs text-slate-600 font-serif">Mon – Fri: 08:00 – 17:00 EAT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-200/90 pt-5 flex items-center justify-center text-xs text-slate-500 text-center font-serif">
            <p>© 2026 PayWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
