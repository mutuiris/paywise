'use client';

import React from 'react';
import { SummaryCardProps, getCardToneClasses, getCardHoverEffects } from './SummaryCard.types';

export type { SummaryCardProps };

export function SummaryCard({
  label,
  value,
  hint,
  tone = 'neutral',
  badge,
  className = '',
  onClick,
}: SummaryCardProps) {
  const timeframeMatch = typeof label === 'string' ? label.match(/\s*\(([^)]+)\)$/) : null;
  const displayLabel = timeframeMatch ? label.replace(timeframeMatch[0], '') : label;
  const displayBadge = badge || (timeframeMatch ? timeframeMatch[1] : undefined);

  const isCurrency = typeof value === 'string' && value.startsWith('KES ');
  const rawNumber = isCurrency ? value.slice(4).trim() : value;
  const isLong = typeof rawNumber === 'string' && rawNumber.length > 7;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-line bg-surface p-4 shadow-2xs flex flex-col justify-between min-h-[105px] cursor-pointer transition-all ${getCardHoverEffects(tone)} ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <p className="text-xs sm:text-sm font-semibold text-ink  truncate">{displayLabel}</p>
          {displayBadge && (
            <span className="shrink-0 rounded bg-canvas border border-line px-1.5 py-0.5 text-[10px] font-semibold text-muted-ink uppercase">
              {displayBadge}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          {isCurrency && <span className="text-xs font-semibold text-muted-ink  uppercase">KES</span>}
          <span className={`font-bold tabular-nums text-ink ${isLong ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
            {rawNumber}
          </span>
        </div>
      </div>
      {hint && <p className={`mt-2 text-[11px]  ${getCardToneClasses(tone)}`}>{hint}</p>}
    </div>
  );
}
