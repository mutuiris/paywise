import React from 'react';
import { BrandIcon } from './BrandIcon';

export { BrandIcon };

interface BrandLogoProps {
  name?: string;
  subtitle?: string;
  markClassName?: string;
  className?: string;
}

export function BrandLogo({
  name = 'PayWise',
  subtitle = 'ImaraWorks Ltd.',
  markClassName = 'size-9',
  className = '',
}: BrandLogoProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <BrandIcon className={markClassName} />
      <span className="min-w-0 text-left">
        <span className="block text-sm font-semibold leading-tight text-ink">
          {name}
        </span>
        <span className="block text-[11px] leading-tight text-muted-ink">
          {subtitle}
        </span>
      </span>
    </span>
  );
}
