import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SubmitButtonProps {
  label?: string;
  disabled?: boolean;
}

export function SubmitButton({ label = 'Sign in', disabled = false }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-deep active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span>{label}</span>
      <ArrowRight className="size-4" />
    </button>
  );
}
