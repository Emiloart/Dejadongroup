import Link from "next/link";
import { businesses, mainNavigation } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-orangeAction/15 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-card bg-orangeAction text-sm font-bold text-white">
              DJ
            </span>
            <span className="text-lg font-semibold">De Jadon Group</span>
          </Link>
          <div className="mt-5 h-1 w-16 rounded-full bg-orangeAction" />
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-semibold text-orange-200">Navigation</h2>
          <div className="mt-4 grid gap-2">
            {mainNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-stone-200 hover:text-orange-200">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <nav aria-label="Footer businesses">
          <h2 className="text-sm font-semibold text-orange-200">Businesses</h2>
          <div className="mt-4 grid gap-2">
            {businesses.map((business) => (
              <Link key={business.href} href={business.href} className="text-sm text-stone-200 hover:text-orange-200">
                {business.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-stone-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <span>De Jadon Group</span>
          <Link href="/contact" className="font-semibold text-orange-200 hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
