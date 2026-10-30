import React from 'react';
import Image from 'next/image';
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
  markClassName = 'h-9 w-auto object-contain',
  className = '',
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/images/logo.png"
        alt={`${name} — ${subtitle}`}
        width={160}
        height={50}
        className={markClassName}
        priority
      />
    </span>
  );
}
