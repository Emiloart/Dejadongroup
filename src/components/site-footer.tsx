import Link from "next/link";
import { mainNavigation } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-sm font-semibold text-ink">De Jadon Group</p>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-3">
          {mainNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-stone-600 hover:text-orangeAction">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
