import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, FileText, Handshake, LayoutDashboard, Link2, Mail, Newspaper, Package, Settings, Sprout, Users, type LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AdminSignOut } from "@/components/admin-sign-out";
import { adminSections, type AdminSectionId } from "@/lib/admin-data";
import { isSuperAdminAuthenticated } from "@/lib/admin-auth";

const icons: Record<AdminSectionId, LucideIcon> = {
  overview: LayoutDashboard,
  products: Package,
  news: Newspaper,
  newsletter: Mail,
  clients: Users,
  partners: Handshake,
  referrals: Link2,
  "land-farms": Sprout,
  content: FileText,
  settings: Settings
};

export function AdminShell({ section, children }: { section: AdminSectionId; children: ReactNode }) {
  const current = adminSections.find((item) => item.id === section);
  const superAdmin = isSuperAdminAuthenticated();

  return (
    <div className="min-h-screen bg-warm text-ink lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink">Skip to main content</a>
      <aside className="bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:px-6 lg:py-8">
        <Link href="/admin" className="mx-5 flex min-h-20 flex-col items-start justify-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:mx-0 lg:min-h-0">
          <BrandLogo light className="h-11 w-auto" />
          <span className="text-xs text-stone-300">Admin workspace</span>
        </Link>

        <div className="hidden lg:mt-10 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">Workspace</p>
          <p className="mt-2 text-sm leading-6 text-stone-300">Operations and account management</p>
        </div>

        <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 pb-2 lg:mt-8 lg:grid lg:gap-1 lg:overflow-visible lg:border-t-0 lg:px-0 lg:pb-0">
          {adminSections.filter((item) => item.id !== "partners" || superAdmin).map((item) => {
            const Icon = icons[item.id];
            const active = item.id === section;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-12 shrink-0 items-center gap-2.5 border-b-2 px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:min-h-11 lg:border-b-0 lg:border-l-2 ${active ? "border-orangeAction text-white" : "border-transparent text-stone-300 hover:text-white"}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden border-t border-white/10 pt-6 lg:block">
          <p className="text-xs leading-5 text-stone-300">{superAdmin ? "Super Admin · Manage the Partner Programme, client records and website content." : "Admin · Manage client records and website content."}</p>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white hover:text-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Visit website <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-ink/10">
          <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 sm:px-8 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">Admin workspace <span aria-hidden="true" className="px-2 text-stone-400">/</span> {current?.label}</p>
            <div className="flex items-center gap-5">
              <Link href="/marketplace" className="inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-orange-700 hover:text-orange-800">View marketplace <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
              <AdminSignOut />
            </div>
          </div>
        </header>
        <main id="main-content" className="mx-auto max-w-7xl px-5 pb-20 pt-9 sm:px-8 lg:px-10 lg:pt-12">{children}</main>
      </div>
    </div>
  );
}
