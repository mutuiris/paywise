import React from 'react';
import { SignInHero } from './SignInHero';
import { SignInHeader } from './SignInHeader';
import { SignInForm } from './SignInForm';

export function SignInCard() {
  return (
    <div className="grid min-h-screen bg-white font-serif lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_500px]">
      <SignInHero />
      <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <SignInHeader />
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
