import { STEPS } from './stepsData';
import { StepCard } from './StepCard';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-slate-200/80 bg-white py-12 sm:py-14 font-serif">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Transparent payment tracking from request to completion, keeping project teams, managers, and Finance aligned at every step.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {STEPS.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
