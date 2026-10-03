"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { businesses, mainNavigation } from "@/lib/site-data";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [businessesOpen, setBusinessesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setBusinessesOpen(false);
  }, [pathname]);

  useEffect(() => {
    function closeDropdown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) setBusinessesOpen(false);
    }

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-orangeAction/15 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-orangeAction text-sm font-bold text-white">
            DJ
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold leading-tight text-ink">De Jadon Group</span>
            <span className="mt-1 block h-0.5 w-12 rounded-full bg-orangeAction transition group-hover:w-20" />
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {mainNavigation.map((item) => {
            const active = isActivePath(pathname, item.href);

            if (item.label === "Businesses") {
              return (
                <div key={item.href} ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    aria-expanded={businessesOpen}
                    aria-haspopup="menu"
                    className={`flex items-center gap-1 rounded-card px-3 py-2 text-sm font-semibold transition ${
                      active ? "bg-orange-50 text-orangeAction" : "text-stone-700 hover:bg-orange-50 hover:text-orangeAction"
                    }`}
                    onClick={() => setBusinessesOpen((open) => !open)}
                  >
                    Businesses
                    <ChevronDown aria-hidden="true" className={`h-4 w-4 transition ${businessesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {businessesOpen ? (
                    <div
                      role="menu"
                      className="absolute left-0 top-full mt-2 w-64 rounded-card border border-orangeAction/15 bg-white p-2 shadow-xl"
                    >
                      <Link role="menuitem" href="/businesses" className="block rounded-card px-3 py-2.5 text-sm font-semibold text-ink hover:bg-orange-50">
                        All Businesses
                      </Link>
                      <div className="my-1 border-t border-stone-100" />
                      {businesses.map((business) => (
                        <Link
                          key={business.href}
                          role="menuitem"
                          href={business.href}
                          className="block rounded-card px-3 py-2.5 text-sm font-semibold text-stone-600 hover:bg-orange-50 hover:text-orangeAction"
                        >
                          {business.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-card px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-orange-50 text-orangeAction" : "text-stone-700 hover:bg-orange-50 hover:text-orangeAction"
                } ${item.label === "Login" ? "ml-2 border border-orangeAction bg-orangeAction text-white hover:bg-orange-700 hover:text-white" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          className="rounded-card border border-orangeAction/30 p-2 text-orangeAction lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="max-h-[calc(100vh-69px)] overflow-y-auto border-t border-orangeAction/15 bg-white px-5 py-4 shadow-sm lg:hidden">
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {mainNavigation.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                  className={`block rounded-card px-3 py-3 text-sm font-semibold ${
                    isActivePath(pathname, item.href) ? "bg-orange-50 text-orangeAction" : "text-stone-700 hover:bg-orange-50"
                  }`}
                >
                  {item.label}
                </Link>
                {item.label === "Businesses" ? (
                  <div className="ml-3 grid border-l border-orangeAction/20 pl-3">
                    {businesses.map((business) => (
                      <Link key={business.href} href={business.href} className="rounded-card px-3 py-2.5 text-sm font-medium text-stone-600 hover:text-orangeAction">
                        {business.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
