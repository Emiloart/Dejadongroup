import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { DashboardAccessGate } from "@/components/dashboard-access-gate";
import { DashboardSignOut } from "@/components/dashboard-sign-out";
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
    <DashboardAccessGate role={role}>
    <div className="min-h-screen bg-warm text-ink lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:px-6 lg:py-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="mx-5 my-4 inline-flex items-center gap-3 lg:mx-0 lg:my-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-orangeAction text-sm font-bold text-white">DJ</span>
            <span className="min-w-0">
              <span className="block text-base font-semibold leading-tight">De Jadon Group</span>
              <span className="block text-xs text-stone-300">Account workspace</span>
            </span>
          </Link>
          <div className="pr-5 lg:hidden"><DashboardSignOut role={role} /></div>
        </div>

        <nav aria-label="Choose dashboard" className="flex gap-6 border-t border-white/10 px-5 lg:mt-7 lg:border-t-0 lg:border-b lg:border-white/15 lg:px-0">
          {validDashboardRoles.map((dashboardRole) => (
            <Link
              key={dashboardRole}
              href={dashboardRole === role ? overviewHref : "/login?role=" + dashboardRole + "&next=" + encodeURIComponent("/dashboard/" + dashboardRole)}
              aria-current={role === dashboardRole ? "true" : undefined}
              className={`min-h-10 border-b-2 py-2 text-sm font-semibold capitalize transition-colors lg:min-h-11 ${
                role === dashboardRole ? "border-orangeAction text-white" : "border-transparent text-stone-400 hover:text-white"
              }`}
            >
              {dashboardRole}
            </Link>
          ))}
        </nav>

        <nav aria-label="Account pages" className="flex border-t border-white/10 px-5 lg:mt-6 lg:grid lg:gap-1 lg:border-t-0 lg:px-0">
          <Link href={overviewHref} aria-current={page === "overview" ? "page" : undefined} className={`flex min-h-12 flex-1 items-center justify-center border-b-2 px-2 text-sm font-semibold transition-colors lg:min-h-11 lg:justify-start lg:border-b-0 lg:border-l-2 lg:px-3 ${page === "overview" ? "border-orangeAction text-white" : "border-transparent text-stone-300 hover:text-white"}`}>
            Overview
          </Link>
          <Link href={profileHref} aria-current={page === "profile" ? "page" : undefined} className={`flex min-h-12 flex-1 items-center justify-center border-b-2 px-2 text-sm font-semibold transition-colors lg:min-h-11 lg:justify-start lg:border-b-0 lg:border-l-2 lg:px-3 ${page === "profile" ? "border-orangeAction text-white" : "border-transparent text-stone-300 hover:text-white"}`}>
            Profile &amp; referral
          </Link>
        </nav>

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
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-3 sm:px-8 lg:px-10 lg:py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">{dashboardLabels[role]} <span aria-hidden="true" className="px-2 text-stone-300">/</span> {page}</p>
            <div className="hidden items-center gap-5 lg:flex">
              <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-stone-600 hover:text-orangeAction" href="/">Website</Link>
              <DashboardSignOut role={role} />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pt-12">{children}</main>
      </div>
    </div>
    </DashboardAccessGate>
  );
}
