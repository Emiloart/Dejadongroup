import Link from "next/link";
import { mainNavigation } from "@/lib/site-data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="text-lg font-semibold text-ink">
          De Jadon Group
        </Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-2">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-card px-3 py-2 text-sm font-medium text-stone-700 hover:bg-warm hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
