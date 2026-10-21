export interface SummaryCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'neutral' | 'ok' | 'warn' | 'err' | 'brand';
  badge?: string;
  className?: string;
  onClick?: () => void;
}

export function getCardToneClasses(tone: SummaryCardProps['tone'] = 'neutral'): string {
  switch (tone) {
    case 'ok': return 'text-ok';
    case 'warn': return 'text-warn';
    case 'err': return 'text-err';
    case 'brand': return 'text-brand-deep';
    default: return 'text-muted-ink';
  }
}

export function getCardHoverEffects(tone: SummaryCardProps['tone'] = 'neutral'): string {
  switch (tone) {
    case 'ok': return 'hover:bg-ok-light/70 hover:border-ok/40 hover:shadow-xs';
    case 'warn': return 'hover:bg-warn-light/70 hover:border-warn/40 hover:shadow-xs';
    case 'err': return 'hover:bg-err-light/70 hover:border-err/40 hover:shadow-xs';
    case 'brand': return 'hover:bg-brand-light/70 hover:border-brand/40 hover:shadow-xs';
    default: return 'hover:bg-slate-50/80 hover:border-slate-300 hover:shadow-xs';
  }
}
