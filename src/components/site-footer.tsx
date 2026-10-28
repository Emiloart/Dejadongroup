import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { businesses, foodPackagePromotion } from "@/lib/site-data";
import { SocialLinks } from "@/components/social-links";

const footerLinkClass = "text-sm leading-6 text-stone-300 transition-colors hover:text-orange-200";

export function SiteFooter() {
  return (
    <footer className="border-t border-orangeAction/15 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-10 px-5 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr_0.9fr_1.5fr] lg:px-8 lg:py-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" aria-label="De Jadon Group, home" className="inline-block rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <BrandLogo light className="h-12 w-auto" />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-7 text-stone-300">Creating opportunities in agriculture, productive land and structured savings.</p>
          <SocialLinks className="mt-5" light />
        </div>

        <nav aria-label="Footer company">
          <h2 className="text-sm font-semibold text-white">Company</h2>
          <div className="mt-4 grid gap-2">
            <Link href="/" className={footerLinkClass}>Home</Link>
            <Link href="/about" className={footerLinkClass}>About us</Link>
            <Link href="/partner-program" className={footerLinkClass}>Partner program</Link>
          </div>
        </nav>

        <nav aria-label="Footer businesses">
          <h2 className="text-sm font-semibold text-white">Businesses</h2>
          <div className="mt-4 grid gap-2">
            {businesses.map((business) => (
              <Link key={business.href} href={business.href} className={footerLinkClass}>{business.name}</Link>
            ))}
            <Link href="/businesses" className={footerLinkClass}>All businesses</Link>
          </div>
        </nav>

        <nav aria-label="Footer explore">
          <h2 className="text-sm font-semibold text-white">Explore</h2>
          <div className="mt-4 grid gap-2">
            <Link href="/marketplace" className={footerLinkClass}>Marketplace</Link>
            <Link href="/gallery" className={footerLinkClass}>Gallery</Link>
            {foodPackagePromotion.active ? <Link href={foodPackagePromotion.canonicalHref} className={footerLinkClass}>Food packages</Link> : null}
            <Link href="/login" className={footerLinkClass}>Account login</Link>
          </div>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-white">Contact</h2>
          <address className="mt-4 grid gap-3 text-sm not-italic leading-6 text-stone-300">
            <a href="tel:+2348070458759" className="w-fit transition-colors hover:text-orange-200">08070458759</a>
            <a href="mailto:dejadongroup@gmail.com" className="w-fit break-all transition-colors hover:text-orange-200">dejadongroup@gmail.com</a>
            <p>Shop C15 Ebube Dike Shopping Mall, Umuodu Road, Good Will Junction, Nodu, Okpuno, Awka, Anambra State.</p>
          </address>
          <p className="mt-3 text-sm leading-6 text-stone-400">Working hours: 8:30am – 5:00pm</p>
          <Link href="/contact" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-orange-200 hover:text-white">Contact our team →</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs leading-6 text-stone-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} De Jadon Group. All rights reserved.</span>
          <span>Agriculture · Agro-Real Estate · Flexisave</span>
        </div>
      </div>
    </footer>
  );
}
