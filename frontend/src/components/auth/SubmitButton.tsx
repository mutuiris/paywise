import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SubmitButtonProps {
  label?: string;
}

export function SubmitButton({ label = 'Sign in' }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-deep active:scale-[0.99] transition-all cursor-pointer"
    >
      <span>{label}</span>
      <ArrowRight className="size-4" />
    </button>
  );
}
