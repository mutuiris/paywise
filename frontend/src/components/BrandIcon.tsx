import React from 'react';

interface BrandIconProps {
  className?: string;
}

export function BrandIcon({ className = 'size-9' }: BrandIconProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-sm ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="h-full w-full p-1.5 text-white"
      >
        <path
          d="M10 12v16M18 12v10"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M18 12h7a6 6 0 0 1 0 12h-3"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="m18 28 4 4 9-10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
