import React from 'react';
import Image from 'next/image';

export function SignInHero() {
  return (
    <div className="relative hidden lg:block min-h-screen w-full overflow-hidden border-r border-line bg-slate-900">
      <Image
        src="/images/paywise-signin.png"
        alt="PayWise Vendor Payment Management"
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 1024px) 100vw, 70vw"
      />
    </div>
  );
}
