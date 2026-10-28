import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { adminSubsections } from "@/lib/admin-data";

export default function AdminOverviewPage() {
  return (
    <AdminShell section="overview">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Operations workspace</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Overview</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">A starting point for client, partner, referral, and property operations across De Jadon Group.</p>
      </div>

      <div className="mt-10 border-y border-ink/10 py-6 sm:flex sm:items-start sm:gap-10">
        <p className="shrink-0 text-sm font-semibold text-ink">Preview status</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:mt-0">This page shows the admin layout and navigation. Live records and admin permissions will be connected as the workspace is built.</p>
      </div>

      <section aria-labelledby="areas-heading" className="mt-12">
        <div className="max-w-2xl">
          <h2 id="areas-heading" className="text-2xl font-medium">Workspace areas</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Open an area to see where its tools and records will live.</p>
        </div>
        <div className="mt-6 grid border-t border-ink/10 sm:grid-cols-2 sm:gap-x-10">
          {adminSubsections.map((section) => (
            <Link key={section.id} href={section.href} className="group flex min-h-28 items-start justify-between gap-5 border-b border-ink/10 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
              <span>
                <span className="block text-base font-semibold text-ink group-hover:text-orange-700">{section.label}</span>
                <span className="mt-2 block text-sm leading-6 text-stone-600">{section.description}</span>
              </span>
              <ArrowUpRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-orange-700" />
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
