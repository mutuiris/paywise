import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden animate-in slide-in-from-top-2">
      <div className="flex flex-col space-y-3">
        <Link href="#how-it-works" onClick={onClose} className="text-sm font-medium text-slate-700 hover:text-[#004aad]">
          How It Works
        </Link>
        <Link href="#features" onClick={onClose} className="text-sm font-medium text-slate-700 hover:text-[#004aad]">
          Features
        </Link>
        <Link href="#location" onClick={onClose} className="text-sm font-medium text-slate-700 hover:text-[#004aad]">
          Location
        </Link>
        <Link href="#contact" onClick={onClose} className="text-sm font-medium text-slate-700 hover:text-[#004aad] flex items-center gap-1.5">
          <Phone className="size-3.5 text-[#004aad]" />
          <span>Contact</span>
        </Link>
        <Link href="/login" onClick={onClose} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#004aad] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003887]">
          <span>Sign In to Portal</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
