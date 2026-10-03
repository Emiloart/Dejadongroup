import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { dashboardLabels, dashboardSections, validDashboardRoles } from "@/lib/dashboard-data";
import type { DashboardRole } from "@/types/site";

type DashboardLayoutProps = {
  role: DashboardRole;
  children: ReactNode;
};

function cardId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const sections = dashboardSections[role];

  return (
    <div className="min-h-screen bg-warm text-ink lg:flex">
      <aside className="bg-ink px-5 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:flex-shrink-0 lg:overflow-y-auto lg:px-6 lg:py-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orangeAction text-sm font-bold text-white">
            DJ
          </span>
          <span>
            <span className="block text-lg font-semibold leading-tight">De Jadon Group</span>
            <span className="block text-xs font-semibold text-orange-200">Dashboard</span>
          </span>
        </Link>

        <div className="mt-6 flex gap-6 border-b border-white/15">
          {validDashboardRoles.map((dashboardRole) => (
            <Link
              key={dashboardRole}
              href={`/dashboard/${dashboardRole}`}
              aria-current={role === dashboardRole ? "page" : undefined}
              className={`border-b-2 pb-3 text-sm font-semibold capitalize transition-colors ${
                role === dashboardRole ? "border-orangeAction text-white" : "border-transparent text-stone-400 hover:text-white"
              }`}
            >
              {dashboardRole}
            </Link>
          ))}
        </div>

        <details className="group mt-4 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2 text-sm font-semibold text-stone-200 [&::-webkit-details-marker]:hidden">
            Jump to a section
            <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <nav aria-label={`${dashboardLabels[role]} mobile navigation`} className="mt-2 grid gap-1 border-t border-white/10 pt-3">
            {sections.map((section) => (
              <a
                key={section.label}
                href={`#section-${cardId(section.label)}`}
                className="py-2 text-sm text-stone-300 hover:text-orange-200"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </details>

        <nav aria-label={`${dashboardLabels[role]} navigation`} className="mt-8 hidden lg:block">
          <div className="grid gap-7">
            {sections.map((section) => (
              <div key={section.label}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-orange-200">{section.label}</p>
                <div className="grid gap-1">
                  {section.items.map((card) => (
                    <a
                      key={card.title}
                      href={`#${cardId(card.title)}`}
                      className="py-1.5 text-sm text-stone-300 transition-colors hover:text-white"
                    >
                      {card.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <Link
          href="/"
          className="mt-8 hidden items-center gap-2 border-t border-white/10 pt-5 text-sm font-semibold text-stone-300 hover:text-orange-200 lg:flex"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to Website
        </Link>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-stone-200">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8 lg:px-10">
            <h1 className="text-base font-semibold sm:text-lg">{dashboardLabels[role]}</h1>
            <div className="flex items-center gap-5">
              <Link className="text-sm font-semibold text-stone-600 hover:text-orangeAction" href="/">
                Website
              </Link>
              <Link className="text-sm font-semibold text-orangeAction hover:text-orange-700" href="/login">
                Login
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
