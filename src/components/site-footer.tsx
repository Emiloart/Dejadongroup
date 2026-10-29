import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { businesses } from "@/lib/site-data";
import { SocialLinks } from "@/components/social-links";

const footerLinkClass = "inline-flex min-h-10 items-center text-sm leading-6 text-stone-300 transition-colors hover:text-orange-200";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-start gap-5 border-b border-white/10 py-8 sm:grid-cols-[auto_1fr] sm:gap-12 lg:py-10">
          <div>
            <Link href="/" aria-label="De Jadon Group, home" className="inline-block rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              <BrandLogo light className="h-12 w-auto" />
            </Link>
            <SocialLinks light className="mt-4" />
          </div>
          <p className="max-w-md text-sm leading-7 text-stone-300 sm:justify-self-end">Creating opportunities in agriculture, productive land and structured savings.</p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 py-8 sm:grid-cols-3 lg:gap-x-20 lg:py-10">
          <nav aria-label="Footer company">
            <h2 className="font-sans text-sm font-semibold text-white">Company</h2>
            <ul className="mt-3 space-y-1">
              <li><Link href="/about" className={footerLinkClass}>About us</Link></li>
              <li><Link href="/partner-program" className={footerLinkClass}>Partner programme</Link></li>
              <li><Link href="/contact" className={footerLinkClass}>Contact us</Link></li>
            </ul>
          </nav>
          <nav aria-label="Footer businesses">
            <h2 className="font-sans text-sm font-semibold text-white">Businesses</h2>
            <ul className="mt-3 space-y-1">
              {businesses.map((business) => <li key={business.href}><Link href={business.href} className={footerLinkClass}>{business.name}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="Footer explore" className="col-span-2 sm:col-span-1">
            <h2 className="font-sans text-sm font-semibold text-white">Explore</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-1">
              <li><Link href="/marketplace" className={footerLinkClass}>Marketplace</Link></li>
              <li><Link href="/gallery" className={footerLinkClass}>Gallery</Link></li>
              <li><Link href="/#blogs-news" className={footerLinkClass}>Blog & news</Link></li>
              <li><Link href="/login" className={footerLinkClass}>Account login</Link></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-white/10 py-5 text-xs leading-6 text-stone-400">
          © {new Date().getFullYear()} De Jadon Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
