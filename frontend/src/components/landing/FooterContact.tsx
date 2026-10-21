import { CONTACT_DETAILS } from './footerData';

export function FooterContact() {
  return (
    <div className="lg:col-span-3">
      <h4 className="font-semibold text-slate-900 mb-3 text-sm tracking-wide">Contact</h4>
      <div className="space-y-2.5">
        {CONTACT_DETAILS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
              <div className="border border-[#004aad]/30 rounded-lg p-1.5 bg-white shadow-2xs shrink-0">
                <Icon className="size-3.5 text-[#004aad]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                {item.href ? (
                  <a className="text-xs text-[#004aad] hover:underline break-all" href={item.href}>
                    {item.value}
                  </a>
                ) : (
                  <p className="text-xs text-slate-600">{item.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
