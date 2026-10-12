'use client';

import React from 'react';

interface SummaryCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'neutral' | 'ok' | 'warn' | 'err' | 'brand';
  className?: string;
}

export function SummaryCard({
  label,
  value,
  hint,
  tone = 'neutral',
  className = '',
}: SummaryCardProps) {
  const toneClasses = {
    neutral: 'text-muted-ink',
    ok: 'text-ok',
    warn: 'text-warn',
    err: 'text-err',
    brand: 'text-brand-deep',
  }[tone];

  const hoverEffects = {
    neutral: 'hover:bg-slate-50/80 hover:border-slate-300 hover:shadow-xs active:bg-slate-100',
    ok: 'hover:bg-ok-light/70 hover:border-ok/40 hover:shadow-xs active:bg-ok-light',
    warn: 'hover:bg-warn-light/70 hover:border-warn/40 hover:shadow-xs active:bg-warn-light',
    err: 'hover:bg-err-light/70 hover:border-err/40 hover:shadow-xs active:bg-err-light',
    brand: 'hover:bg-brand-light/70 hover:border-brand/40 hover:shadow-xs active:bg-brand-light',
  }[tone];

  return (
    <div
      className={`rounded-xl border border-line bg-surface p-4 shadow-2xs transition-all duration-150 cursor-pointer ${hoverEffects} ${className}`}
    >
      <p className="text-[12px] font-medium text-muted-ink font-serif">{label}</p>
      <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-ink">
        {value}
      </p>
      {hint ? (
        <p className={`mt-1 text-[11px] font-medium font-serif ${toneClasses}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
