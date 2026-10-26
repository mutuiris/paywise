import { MapPin } from 'lucide-react';

export function LocationMap() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-md bg-slate-50 h-[280px] sm:h-[320px] lg:h-[340px] w-full max-w-5xl mx-auto group">
      <iframe
        title="PayWise ImaraWorks Headquarters Nairobi Kenya"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.814321956123!2d36.8155!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10dfb9e4a3b1%3A0x7d6b38c29b71e16a!2sUpper%20Hill%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      />
      <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-md flex items-center gap-2 sm:gap-2.5 pointer-events-none">
        <div className="relative flex size-8 sm:size-9 items-center justify-center rounded-lg bg-teal-50 border border-teal-200/80 text-teal-700 shrink-0">
          <MapPin className="size-4 sm:size-4.5 text-teal-600" />
          <span className="absolute -inset-1 rounded-lg bg-teal-400/20 animate-pulse pointer-events-none" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-900">ImaraWorks Tower</p>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Upper Hill · Nairobi, Kenya</p>
        </div>
      </div>
    </div>
  );
}
