"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { businesses, mainNavigation } from "@/lib/site-data";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [businessesOpen, setBusinessesOpen] = useState(false);
  const [mobileBusinessesOpen, setMobileBusinessesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const firstBusinessLinkRef = useRef<HTMLAnchorElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setBusinessesOpen(false);
    setMobileBusinessesOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) setBusinessesOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (businessesOpen) {
        setBusinessesOpen(false);
        dropdownButtonRef.current?.focus();
      } else if (menuOpen) {
        setMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [businessesOpen, menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="De Jadon Group, home" onClick={() => setMenuOpen(false)} className="group flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-orangeAction text-sm font-bold text-white">DJ</span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold leading-tight text-ink">De Jadon Group</span>
            <span className="mt-1 block h-0.5 w-12 rounded-full bg-orangeAction transition-all group-hover:w-20" />
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 lg:flex">
          {mainNavigation.map((item) => {
            const active = isActivePath(pathname, item.href);
            if (item.label === "Businesses") {
              return (
                <div key={item.href} ref={dropdownRef} className="relative">
                  <button
                    ref={dropdownButtonRef}
                    type="button"
                    aria-expanded={businessesOpen}
                    aria-controls="desktop-business-links"
                    className={`flex items-center gap-1.5 rounded-card px-3 py-2.5 text-sm font-semibold transition-colors hover:text-orangeAction ${active ? "text-orangeAction" : "text-stone-700"}`}
                    onClick={() => setBusinessesOpen((open) => !open)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setBusinessesOpen(true);
                        requestAnimationFrame(() => firstBusinessLinkRef.current?.focus());
                      }
                    }}
                  >
                    Businesses
                    <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${businessesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {businessesOpen ? (
                    <div id="desktop-business-links" className="absolute left-0 top-full mt-2 w-64 rounded-card border border-ink/10 bg-white p-2 shadow-lg shadow-ink/10">
                      <Link ref={firstBusinessLinkRef} href="/businesses" onClick={() => setBusinessesOpen(false)} className="block rounded-card px-3 py-2.5 text-sm font-semibold text-ink hover:bg-orange-50 hover:text-orangeAction">All Businesses</Link>
                      <div className="my-1 border-t border-ink/10" />
                      {businesses.map((business) => (
                        <Link key={business.href} href={business.href} aria-current={isActivePath(pathname, business.href) ? "page" : undefined} onClick={() => setBusinessesOpen(false)} className="block rounded-card px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-orange-50 hover:text-orangeAction">
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
                className={`rounded-card px-3 py-2.5 text-sm font-semibold transition-colors ${item.label === "Login" ? "ml-2 border border-orangeAction bg-orangeAction text-white hover:bg-orange-700" : active ? "text-orangeAction" : "text-stone-700 hover:text-orangeAction"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          ref={mobileMenuButtonRef}
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="rounded-card p-2 text-orangeAction hover:bg-orange-50 lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-ink/10 bg-white px-5 py-3 shadow-md lg:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto grid max-w-7xl gap-0.5 sm:px-1">
            {mainNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <div key={item.href}>
                  {item.label === "Businesses" ? (
                    <div className="flex items-center">
                      <Link href={item.href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={`flex-1 rounded-card px-3 py-3 text-sm font-semibold ${active ? "text-orangeAction" : "text-stone-700 hover:text-orangeAction"}`}>Businesses</Link>
                      <button type="button" aria-label="Show business pages" aria-expanded={mobileBusinessesOpen} aria-controls="mobile-business-links" className="flex h-11 w-11 items-center justify-center rounded-card text-stone-600 hover:bg-orange-50 hover:text-orangeAction" onClick={() => setMobileBusinessesOpen((open) => !open)}>
                        <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${mobileBusinessesOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  ) : (
                    <Link href={item.href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={`block rounded-card px-3 py-3 text-sm font-semibold ${active ? "text-orangeAction" : "text-stone-700 hover:text-orangeAction"}`}>{item.label}</Link>
                  )}
                  {item.label === "Businesses" && mobileBusinessesOpen ? (
                    <div id="mobile-business-links" className="ml-3 grid border-l border-orangeAction/25 pl-3">
                      {businesses.map((business) => (
                        <Link key={business.href} href={business.href} onClick={() => setMenuOpen(false)} aria-current={isActivePath(pathname, business.href) ? "page" : undefined} className="rounded-card px-3 py-2.5 text-sm font-medium text-stone-600 hover:text-orangeAction">{business.name}</Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
