'use client';

import React from 'react';

export interface SummaryCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'neutral' | 'ok' | 'warn' | 'err' | 'brand';
  badge?: string;
  className?: string;
  onClick?: () => void;
}

export function SummaryCard({
  label,
  value,
  hint,
  tone = 'neutral',
  badge,
  className = '',
  onClick,
}: SummaryCardProps) {
  const toneClasses = {
    neutral: 'text-muted-ink',
    ok: 'text-ok',
    warn: 'text-warn',
    err: 'text-err',
    brand: 'text-brand-deep',
  }[tone];

  const hoverEffects = {
    neutral:
      'hover:bg-slate-50/80 hover:border-slate-300 hover:shadow-xs active:bg-slate-100',
    ok: 'hover:bg-ok-light/70 hover:border-ok/40 hover:shadow-xs active:bg-ok-light',
    warn: 'hover:bg-warn-light/70 hover:border-warn/40 hover:shadow-xs active:bg-warn-light',
    err: 'hover:bg-err-light/70 hover:border-err/40 hover:shadow-xs active:bg-err-light',
    brand:
      'hover:bg-brand-light/70 hover:border-brand/40 hover:shadow-xs active:bg-brand-light',
  }[tone];

  // Auto-detect timeframe in parentheses in label, e.g. "Total Disbursed (MTD)" -> label "Total Disbursed", badge "MTD"
  const timeframeMatch = typeof label === 'string' ? label.match(/\s*\(([^)]+)\)$/) : null;
  const displayLabel = timeframeMatch ? label.replace(timeframeMatch[0], '') : label;
  const displayBadge = badge || (timeframeMatch ? timeframeMatch[1] : undefined);

  // Auto-format currency strings starting with "KES "
  const isCurrency = typeof value === 'string' && value.startsWith('KES ');
  const currencyPrefix = isCurrency ? 'KES' : null;
  const rawNumber = isCurrency ? value.slice(4).trim() : value;
  const isLongValue = typeof rawNumber === 'string' && rawNumber.length > 7;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-line bg-surface p-4 sm:p-4.5 shadow-2xs transition-all duration-150 flex flex-col justify-between cursor-pointer min-h-[105px] ${hoverEffects} ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <p className="text-xs sm:text-sm font-semibold text-ink font-serif tracking-tight truncate">
            {displayLabel}
          </p>
          {displayBadge && (
            <span className="shrink-0 rounded bg-canvas border border-line px-1.5 py-0.5 text-[10px] font-semibold text-muted-ink uppercase tracking-wide font-serif">
              {displayBadge}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          {currencyPrefix && (
            <span className="text-xs font-semibold text-muted-ink font-serif uppercase tracking-wider">
              {currencyPrefix}
            </span>
          )}
          <span
            className={`font-serif font-bold tabular-nums text-ink tracking-tight ${
              isLongValue ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {rawNumber}
          </span>
        </div>
      </div>

      {hint ? (
        <p className={`mt-2 text-[11px] font-normal font-serif leading-tight ${toneClasses}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
