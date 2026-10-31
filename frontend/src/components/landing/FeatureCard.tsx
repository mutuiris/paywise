import { FeatureItem } from './types';

export function FeatureCard({ title, description, icon: Icon }: FeatureItem) {
  return (
    <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/50 hover:shadow-md font-serif">
      <div className="mb-3.5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#004aad]/10 via-[#004aad]/5 to-[#f59e0b]/10 border border-[#004aad]/15 text-[#004aad] group-hover:scale-105 group-hover:border-[#f59e0b]/50 transition-all duration-300">
          <Icon className="size-4.5 text-[#004aad] group-hover:text-[#f59e0b] transition-colors duration-300" />
        </div>
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
