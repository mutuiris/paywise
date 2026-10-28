'use client';

import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { FeaturesSection } from './FeaturesSection';
import { LocationSection } from './LocationSection';
import { LandingFooter } from './LandingFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-serif text-slate-900 antialiased selection:bg-[#004aad] selection:text-white">
      <LandingNavbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <LocationSection />
      </main>
      <LandingFooter />
    </div>
  );
}
