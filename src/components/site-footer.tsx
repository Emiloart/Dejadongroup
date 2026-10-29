import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { businesses, foodPackagePromotion } from "@/lib/site-data";
import { SocialLinks } from "@/components/social-links";

const footerLinkClass = "inline-flex min-h-9 items-center text-sm leading-6 text-stone-300 transition-colors hover:text-orange-200";

export function SiteFooter() {
  return (
    <footer className="border-t border-orangeAction/15 bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5 py-5">
          <Link href="/" aria-label="De Jadon Group, home" className="inline-block rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <BrandLogo light className="h-11 w-auto" />
          </Link>
          <p className="max-w-md text-sm leading-6 text-stone-400">Creating opportunities in agriculture, productive land and structured savings.</p>
          <SocialLinks light />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 border-y border-white/10 py-6 sm:grid-cols-3 sm:gap-x-10">
          <nav aria-label="Footer company">
            <h2 className="text-sm font-semibold text-white">Company</h2>
            <div className="mt-2 grid lg:grid-cols-2 lg:gap-x-4">
              <Link href="/" className={footerLinkClass}>Home</Link>
              <Link href="/about" className={footerLinkClass}>About us</Link>
              <Link href="/partner-program" className={footerLinkClass}>Partner program</Link>
              <Link href="/contact" className={footerLinkClass}>Contact us</Link>
            </div>
          </nav>

          <nav aria-label="Footer businesses">
            <h2 className="text-sm font-semibold text-white">Businesses</h2>
            <div className="mt-2 grid lg:grid-cols-2 lg:gap-x-4">
              {businesses.map((business) => (
                <Link key={business.href} href={business.href} className={footerLinkClass}>{business.name}</Link>
              ))}
              <Link href="/businesses" className={footerLinkClass}>All businesses</Link>
            </div>
          </nav>

          <nav aria-label="Footer explore" className="col-span-2 sm:col-span-1">
            <h2 className="text-sm font-semibold text-white">Explore</h2>
            <div className="mt-2 grid grid-cols-2 gap-x-6 sm:grid-cols-1 lg:grid-cols-2 lg:gap-x-4">
              <Link href="/marketplace" className={footerLinkClass}>Marketplace</Link>
              <Link href="/gallery" className={footerLinkClass}>Gallery</Link>
              <Link href="/#blogs-news" className={footerLinkClass}>Blog & news</Link>
              {foodPackagePromotion.active ? <Link href={foodPackagePromotion.canonicalHref} className={footerLinkClass}>Food packages</Link> : null}
              <Link href="/login" className={footerLinkClass}>Account login</Link>
            </div>
          </nav>

        </div>
        <div className="flex flex-col gap-1 py-3 text-xs leading-6 text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} De Jadon Group. All rights reserved.</span>
          <span>Agriculture · Agro-Real Estate · Flexisave</span>
        </div>
      </div>
    </footer>
  );
}
