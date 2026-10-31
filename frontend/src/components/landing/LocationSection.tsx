import { LocationMap } from './LocationMap';

export function LocationSection() {
  return (
    <section id="location" className="border-t border-slate-200 bg-white py-12 sm:py-14 font-serif">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Location
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Proudly built to power fast, transparent, and auditable payments for businesses across Kenya.
          </p>
        </div>
        <LocationMap />
      </div>
    </section>
  );
}
