'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  User as UserIcon,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BrandLogo } from '@/components/BrandLogo';
import { ROLE_LABELS, ROLE_BADGE_STYLES } from '@/types/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, hydrated, logout } = useAuth();

  useEffect(() => {
    if (hydrated && !user) {
      router.push('/login');
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="text-sm text-muted-ink">Loading session…</div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <BrandLogo />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-ink">{user.name}</span>
              <span className="text-xs text-muted-ink">{user.email}</span>
            </div>
            <span
              className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                ROLE_BADGE_STYLES[user.role]
              }`}
            >
              {ROLE_LABELS[user.role]}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="size-3.5 text-muted-ink" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="rounded-xl border border-line bg-surface p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200 mb-3">
                <CheckCircle2 className="size-3.5" />
                Signed in successfully
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Welcome back, {user.name}
              </h1>
              <p className="mt-1 text-sm text-muted-ink">
                Department: <span className="font-medium text-ink">{user.department || 'General'}</span> • Role: <span className="font-medium text-ink">{ROLE_LABELS[user.role]}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats / Info Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-ink">Role</span>
              <ShieldCheck className="size-4 text-brand" />
            </div>
            <p className="mt-2 text-xl font-bold text-ink">{ROLE_LABELS[user.role]}</p>
            <p className="mt-1 text-xs text-muted-ink">Account status: Active</p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-ink">Email</span>
              <UserIcon className="size-4 text-brand" />
            </div>
            <p className="mt-2 text-sm font-semibold text-ink truncate">{user.email}</p>
            <p className="mt-1 text-xs text-muted-ink">Work identity verified</p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-ink">Approval Limit</span>
              <Clock className="size-4 text-brand" />
            </div>
            <p className="mt-2 text-xl font-bold text-ink">
              {user.role === 'EMPLOYEE'
                ? 'Requester only'
                : user.role === 'MANAGER'
                ? 'Up to KES 50,000'
                : 'Full Approval'}
            </p>
            <p className="mt-1 text-xs text-muted-ink">Per payment policy</p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-ink">Payment Gateway</span>
              <CreditCard className="size-4 text-brand" />
            </div>
            <p className="mt-2 text-xl font-bold text-ink">Mock Provider</p>
            <p className="mt-1 text-xs text-muted-ink">Simulated transactions</p>
          </div>
        </div>
      </main>
    </div>
  );
}
