import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard } from "lucide-react";
import { dashboardLabels } from "@/lib/site-data";
import type { DashboardRole } from "@/types/site";

type DashboardLayoutProps = {
  role: DashboardRole;
  children: ReactNode;
};

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-warm text-ink">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="rounded-card bg-orangeAction p-2 text-white">
              <LayoutDashboard aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-stone-500">De Jadon Group</p>
              <h1 className="text-xl font-semibold">{dashboardLabels[role]}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-card border border-stone-200 px-4 py-2 text-sm font-semibold hover:bg-warm" href="/login">
              Login
            </Link>
            <Link className="rounded-card bg-orangeAction px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600" href="/">
              Home
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
