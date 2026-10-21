import { FEATURES } from './featuresData';
import { FeatureCard } from './FeatureCard';

export function FeaturesSection() {
  return (
    <section id="features" className="border-y border-slate-200 bg-[#eaf4f6] py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Features
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Six focused modules ensuring precise, transparent, and well-governed disbursements.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
