import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export function ScrollCue() {
  return (
    <Link
      href="#how-it-works"
      className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-0.5 cursor-pointer text-[#004aad] hover:text-[#003887] transition-colors duration-300 font-serif"
    >
      <span className="text-xs font-medium tracking-wide text-[#004aad]">
        Scroll
      </span>
      <ChevronDown className="size-3.5 animate-bounce text-[#004aad]" />
    </Link>
  );
}
