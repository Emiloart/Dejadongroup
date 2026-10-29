import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ClientSignOut } from "@/components/client-sign-out";
import { DashboardRoleSwitcher } from "@/components/dashboard-role-switcher";

const sections = [{ id: "property", label: "Property" }, { id: "investment-plan", label: "Investment Plan" }, { id: "processes", label: "Processes" }, { id: "actual-date", label: "Actual Date" }, { id: "balance", label: "Balance" }, { id: "withdrawal-requests", label: "Withdrawal Requests" }];

export function ClientDashboardLayout({ page, children }: { page: "overview" | "profile"; children: ReactNode }) {
  return <div className="min-h-screen bg-warm text-ink lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
    <a href="#client-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-white focus:px-4 focus:py-3">Skip to client dashboard</a>
    <aside className="bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:px-6 lg:py-8">
      <div className="flex items-center justify-between px-5 py-4 lg:px-0 lg:py-0"><Link href="/" aria-label="De Jadon Group, home"><BrandLogo light className="h-11 w-auto" /><span className="mt-2 block text-xs text-stone-300">Agro-Real Estate</span></Link><div className="lg:hidden"><ClientSignOut /></div></div>
      <DashboardRoleSwitcher role="client" />
      <nav aria-label="Client account pages" className="flex gap-6 border-t border-white/10 px-5 lg:mt-7 lg:grid lg:gap-1 lg:border-0 lg:px-0">{[{ href: "/dashboard/client", label: "Overview", page: "overview" }, { href: "/dashboard/client/profile", label: "Profile", page: "profile" }].map((item) => <Link key={item.href} href={item.href} aria-current={page === item.page ? "page" : undefined} className={`flex min-h-12 items-center border-b-2 text-sm font-semibold lg:border-b-0 lg:border-l-2 lg:px-3 ${page === item.page ? "border-orangeAction text-white" : "border-transparent text-stone-300 hover:text-white"}`}>{item.label}</Link>)}</nav>
      <nav aria-label="Client dashboard sections" className="overflow-x-auto border-t border-white/10 px-5 lg:mt-7 lg:overflow-visible lg:px-0"><div className="flex gap-5 lg:grid lg:gap-0">{sections.map((item) => <a key={item.id} href={`${page === "profile" ? "/dashboard/client" : ""}#${item.id}`} className="flex min-h-11 shrink-0 items-center text-xs text-stone-300 hover:text-white lg:border-b lg:border-white/10 lg:py-2 lg:text-sm">{item.label}</a>)}</div></nav>
      <Link href="/" className="mt-auto hidden min-h-11 items-center pt-6 text-sm font-semibold text-stone-300 hover:text-white lg:flex">Visit website ↗</Link>
    </aside>
    <div className="min-w-0"><header className="border-b border-ink/10"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">Agro-Real Estate client <span aria-hidden="true" className="px-2">/</span> {page}</p><div className="hidden lg:block"><ClientSignOut /></div></div></header><main id="client-main" className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">{children}</main></div>
  </div>;
}
