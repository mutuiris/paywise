import { StepItem } from './types';

export function StepCard({ number, title, description }: StepItem) {
  return (
    <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/50 hover:shadow-md font-serif">
      <div className="mb-2">
        <span className="text-2xl sm:text-3xl font-bold text-[#004aad] group-hover:text-[#f59e0b] transition-colors duration-300">
          {number}
        </span>
      </div>
      <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#f59e0b] transition-colors duration-300">
        {title}
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-normal">
        {description}
      </p>
    </div>
  );
}
