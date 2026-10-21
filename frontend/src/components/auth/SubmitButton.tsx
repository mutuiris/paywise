import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  label?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SubmitButton({
  label = 'Sign in',
  isLoading = false,
  disabled = false,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-medium text-white shadow-xs transition-all ${
        isLoading || disabled
          ? 'bg-brand/75 cursor-not-allowed opacity-90'
          : 'bg-brand hover:bg-brand-deep active:scale-[0.99] cursor-pointer'
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight className="size-4" />
        </>
      )}
    </button>
  );
}
