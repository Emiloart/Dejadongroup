import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { AdminSignOut } from "@/components/admin-sign-out";
import { AdminReauthenticate } from "@/components/admin-reauthenticate";
import { adminSections, type AdminSectionId } from "@/lib/admin-data";
import { currentAdmin } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
export async function AdminShell({ section, children }: { section: AdminSectionId; children: ReactNode }) {
  const admin = await currentAdmin(); if (!admin) return null;
  const allowed = adminSections.filter((item) => !item.permission || can(admin, item.permission));
  return <div className="min-h-screen bg-warm text-ink lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
    <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>
    <aside className="bg-ink px-5 py-6 text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
      <Link href="/admin"><BrandLogo light className="h-11 w-auto" /></Link>
      <p className="mt-4 break-words text-sm">{admin.name}</p><p className="mt-1 text-xs text-stone-300">{admin.roles.map((role) => role.replaceAll("_", " ")).join(" · ")}</p>
      <nav aria-label="Admin sections" className="mt-6 flex gap-2 overflow-x-auto lg:block lg:space-y-1">{allowed.map((item, index) => <div key={item.id} className="shrink-0">{index > 0 && item.department !== allowed[index - 1].department ? <p className="mb-2 mt-6 hidden text-[10px] font-bold uppercase tracking-widest text-orange-200 lg:block">{item.department}</p> : null}<Link aria-current={item.id === section ? "page" : undefined} href={item.href} className={`block rounded-lg px-3 py-3 text-sm ${item.id === section ? "bg-white/15 text-orange-100" : "text-stone-200 hover:bg-white/10"}`}>{item.label}</Link></div>)}</nav>
      <div className="mt-8 flex flex-wrap gap-4 text-sm"><Link href="/">View website</Link><AdminSignOut /></div>
    </aside>
    <main id="main-content" className="min-w-0 px-5 py-8 sm:px-8 lg:p-10"><div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4"><p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{adminSections.find((item) => item.id === section)?.department}</p><AdminReauthenticate /></div>{children}</main>
  </div>;
}
