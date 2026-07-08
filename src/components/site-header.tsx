"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { mainNavigation } from "@/lib/site-data";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-orangeAction/15 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-card bg-orangeAction text-sm font-bold text-white">
            DJ
          </span>
          <span>
            <span className="block text-base font-semibold leading-tight text-ink">De Jadon Group</span>
            <span className="block h-0.5 w-12 rounded-full bg-orangeAction transition group-hover:w-20" />
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-card px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-orange-50 hover:text-orangeAction"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/partner-program"
            className="rounded-card border border-orangeAction px-4 py-2 text-sm font-semibold text-orangeAction hover:bg-orange-50"
          >
            Partner Program
          </Link>
          <Link href="/contact" className="rounded-card bg-orangeAction px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
            Contact
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="rounded-card border border-orangeAction/30 p-2 text-orangeAction lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-orangeAction/15 bg-white px-5 py-4 shadow-sm lg:hidden">
          <nav aria-label="Mobile navigation" className="grid gap-2">
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-card px-3 py-3 text-sm font-semibold text-stone-700 hover:bg-orange-50 hover:text-orangeAction"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
