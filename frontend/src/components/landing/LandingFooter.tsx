import { FooterBrand } from './FooterBrand';
import { FooterLinks } from './FooterLinks';
import { FooterContact } from './FooterContact';

export function LandingFooter() {
  return (
    <footer id="contact" className="w-full bg-white bg-[url('/images/footer.webp')] bg-cover bg-no-repeat bg-center border-t border-slate-200 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 mb-8">
          <FooterBrand />
          <FooterLinks />
          <FooterContact />
        </div>
        <div className="border-t border-slate-200/90 pt-5 flex items-center justify-center text-xs text-slate-500 text-center">
          <p>© 2026 PayWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
