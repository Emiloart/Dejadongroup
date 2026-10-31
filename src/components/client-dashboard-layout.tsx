import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ClientSignOut } from "@/components/client-sign-out";
import { DashboardRoleSwitcher } from "@/components/dashboard-role-switcher";
import { getCurrentClient } from "@/lib/client-auth";
import { serviceAssignments } from "@/lib/client-services";
import { serviceLabels, servicePaths } from "@/lib/savings-types";

const sections = [{ id: "property", label: "Property" }, { id: "investment-plan", label: "Investment Plan" }, { id: "processes", label: "Processes" }, { id: "actual-date", label: "Actual Date" }, { id: "balance", label: "Balance" }, { id: "withdrawal-requests", label: "Withdrawal Requests" }];

export async function ClientDashboardLayout({ page, children }: { page: string; children: ReactNode }) {
  const client = await getCurrentClient();
  const assignments = client ? (await serviceAssignments(client.id)).filter((item) => item.status === "enabled") : [];
  const navigation = [{ href: "/dashboard/client", label: "Overview", page: "overview" }, ...assignments.map((item) => ({ href: `/dashboard/client/${servicePaths[item.service]}`, label: serviceLabels[item.service], page: item.service })), { href: "/dashboard/client/profile", label: "Profile", page: "profile" }];
  return <div className="min-h-screen bg-warm text-ink lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
    <a href="#client-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-white focus:px-4 focus:py-3">Skip to client dashboard</a>
    <aside className="bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:px-6 lg:py-8">
      <div className="flex items-center justify-between px-5 py-4 lg:px-0 lg:py-0"><Link href="/" aria-label="De Jadon Group, home"><BrandLogo light className="h-11 w-auto" /><span className="mt-2 block text-xs text-stone-300">Client account</span></Link><div className="lg:hidden"><ClientSignOut /></div></div>
      <DashboardRoleSwitcher role="client" />
      <nav aria-label="Client account pages" className="flex flex-wrap gap-x-5 gap-y-1 border-t border-white/10 px-5 lg:mt-7 lg:grid lg:gap-1 lg:border-0 lg:px-0">{navigation.map((item) => <Link key={item.href} href={item.href} aria-current={page === item.page ? "page" : undefined} className={`flex min-h-12 items-center border-b-2 text-sm font-semibold lg:border-b-0 lg:border-l-2 lg:px-3 ${page === item.page ? "border-orangeAction text-white" : "border-transparent text-stone-300 hover:text-white"}`}>{item.label}</Link>)}</nav>
      {assignments.some((item) => item.service === "agro_real_estate") ? <nav aria-label="Agro-Real Estate sections" className="border-t border-white/10 px-5 lg:mt-7 lg:px-0"><div className="flex flex-wrap gap-x-5 lg:grid lg:gap-0">{sections.map((item) => <a key={item.id} href={`/dashboard/client/agro-real-estate#${item.id}`} className="flex min-h-11 items-center text-xs text-stone-300 hover:text-white lg:border-b lg:border-white/10 lg:py-2 lg:text-sm">{item.label}</a>)}</div></nav> : null}
      <Link href="/" className="mt-auto hidden min-h-11 items-center pt-6 text-sm font-semibold text-stone-300 hover:text-white lg:flex">Visit website ↗</Link>
    </aside>
    <div className="min-w-0"><header className="border-b border-ink/10"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">Client account <span aria-hidden="true" className="px-2">/</span> {navigation.find((item) => item.page === page)?.label || page}</p><div className="hidden lg:block"><ClientSignOut /></div></div></header><main id="client-main" className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">{children}</main></div>
  </div>;
}
