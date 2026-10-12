import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { dashboardLabels, dashboardSections, validDashboardRoles } from "@/lib/dashboard-data";
import type { DashboardRole } from "@/types/site";

type DashboardLayoutProps = {
  role: DashboardRole;
  page: "overview" | "profile";
  children: ReactNode;
};

function sectionId(label: string) {
  return `section-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function DashboardLayout({ role, page, children }: DashboardLayoutProps) {
  const sections = dashboardSections[role];
  const overviewHref = "/dashboard/" + role;
  const profileHref = overviewHref + "/profile";

  return (
    <div className="min-h-screen bg-warm text-ink lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="bg-ink px-5 py-5 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:px-6 lg:py-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-orangeAction text-sm font-bold text-white">DJ</span>
          <span className="min-w-0">
            <span className="block text-base font-semibold leading-tight">De Jadon Group</span>
            <span className="block text-xs text-stone-300">Account workspace</span>
          </span>
        </Link>

        <nav aria-label="Choose dashboard" className="mt-7 flex gap-6 border-b border-white/15">
          {validDashboardRoles.map((dashboardRole) => (
            <Link
              key={dashboardRole}
              href={`/dashboard/${dashboardRole}`}
              aria-current={role === dashboardRole ? "true" : undefined}
              className={`min-h-11 border-b-2 py-2 text-sm font-semibold capitalize transition-colors ${
                role === dashboardRole ? "border-orangeAction text-white" : "border-transparent text-stone-400 hover:text-white"
              }`}
            >
              {dashboardRole}
            </Link>
          ))}
        </nav>

        <nav aria-label="Account pages" className="mt-6 grid gap-1">
          <Link href={overviewHref} aria-current={page === "overview" ? "page" : undefined} className={`flex min-h-11 items-center border-l-2 px-3 text-sm font-semibold transition-colors ${page === "overview" ? "border-orangeAction bg-white/10 text-white" : "border-transparent text-stone-300 hover:bg-white/5 hover:text-white"}`}>
            Overview
          </Link>
          <Link href={profileHref} aria-current={page === "profile" ? "page" : undefined} className={`flex min-h-11 items-center border-l-2 px-3 text-sm font-semibold transition-colors ${page === "profile" ? "border-orangeAction bg-white/10 text-white" : "border-transparent text-stone-300 hover:bg-white/5 hover:text-white"}`}>
            Profile &amp; referral
          </Link>
        </nav>

        <details className="group mt-3 lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 text-sm font-semibold text-stone-200 [&::-webkit-details-marker]:hidden">
            Jump to a section
            <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <nav aria-label={`${dashboardLabels[role]} sections`} className="grid border-t border-white/10 py-2">
            {sections.map((section) => (
                <a key={section.label} href={page === "overview" ? "#" + sectionId(section.label) : overviewHref + "#" + sectionId(section.label)} className="flex min-h-11 items-center text-sm text-stone-300 hover:text-white">
                {section.label}
              </a>
            ))}
          </nav>
        </details>

        <nav aria-label={`${dashboardLabels[role]} sections`} className="mt-8 hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">Sections</p>
          <div className="mt-4 grid border-t border-white/10">
            {sections.map((section) => (
              <a key={section.label} href={page === "overview" ? "#" + sectionId(section.label) : overviewHref + "#" + sectionId(section.label)} className="flex min-h-12 items-center border-b border-white/10 text-sm text-stone-300 transition-colors hover:pl-1 hover:text-white">
                {section.label}
              </a>
            ))}
          </div>
        </nav>

        <Link href="/" className="mt-auto hidden items-center gap-2 pt-8 text-sm font-semibold text-stone-300 hover:text-white lg:flex">
          Visit website <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-ink/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-4 sm:px-8 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">{dashboardLabels[role]} <span aria-hidden="true" className="px-2 text-stone-300">/</span> {page}</p>
            <div className="flex items-center gap-5">
              <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-stone-600 hover:text-orangeAction" href="/">Website</Link>
              <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-orangeAction hover:text-orange-700" href="/login">Choose portal</Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 pb-20 pt-9 sm:px-8 lg:px-10 lg:pt-12">{children}</main>
      </div>
    </div>
  );
}
