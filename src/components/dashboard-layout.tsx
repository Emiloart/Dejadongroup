import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { dashboardLabels, dashboardSections, validDashboardRoles } from "@/lib/site-data";
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
      <aside className="bg-ink px-5 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:flex-shrink-0 lg:overflow-y-auto">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-card bg-orangeAction text-sm font-bold text-white">
            DJ
          </span>
          <span>
            <span className="block text-lg font-semibold leading-tight">De Jadon Group</span>
            <span className="block text-xs font-semibold text-orange-200">Dashboard</span>
          </span>
        </Link>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-card bg-white/10 p-1">
          {validDashboardRoles.map((dashboardRole) => (
            <Link
              key={dashboardRole}
              href={`/dashboard/${dashboardRole}`}
              className={`rounded-card px-2 py-2 text-center text-xs font-bold capitalize ${
                role === dashboardRole ? "bg-orangeAction text-white" : "text-stone-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {dashboardRole}
            </Link>
          ))}
        </div>

        <nav aria-label={`${dashboardLabels[role]} navigation`} className="mt-6">
          <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-400">{dashboardLabels[role]}</p>
          <div className="grid gap-4">
            {sections.map((section) => (
              <div key={section.label}>
                <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.12em] text-orange-200">{section.label}</p>
                <div className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0">
                  {section.items.map((card) => (
                    <a
                      key={card.title}
                      href={`#${cardId(card.title)}`}
                      className="whitespace-nowrap rounded-card px-3 py-2 text-sm font-semibold text-stone-300 hover:bg-white/10 hover:text-white lg:whitespace-normal"
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
          className="mt-6 hidden items-center gap-2 border-t border-white/10 pt-5 text-sm font-semibold text-stone-300 hover:text-orange-200 lg:flex"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to Website
        </Link>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-orangeAction/15 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-3">
              <span className="rounded-card bg-orangeAction p-2 text-white">
                <LayoutDashboard aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-stone-500">De Jadon Group</p>
                <h1 className="text-2xl font-semibold">{dashboardLabels[role]}</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="image-canvas-pattern flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-orangeAction/35 text-xs font-bold text-orangeAction">
                IMG
              </div>
              <Link className="rounded-card border border-stone-200 px-4 py-2 text-sm font-semibold hover:bg-warm" href="/login">
                Login
              </Link>
              <Link className="rounded-card bg-orangeAction px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700" href="/">
                Home
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
