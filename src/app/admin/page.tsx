import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { adminSubsections } from "@/lib/admin-data";

const snapshotIds = ["clients", "partners", "referrals", "land-farms"] as const;
const workspaceGroups = [
  { title: "Accounts", description: "People using the De Jadon Group portals.", ids: ["clients", "partners"] },
  { title: "Operations", description: "Referrals, property, and farm records.", ids: ["referrals", "land-farms"] },
  { title: "Workspace", description: "Website content and admin configuration.", ids: ["content", "settings"] }
] as const;

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

      <section aria-labelledby="snapshot-heading" className="mt-12">
        <div className="max-w-2xl">
          <h2 id="snapshot-heading" className="text-2xl font-medium">Operations snapshot</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">These spaces will show live totals once admin records are connected.</p>
        </div>
        <nav aria-label="Operations snapshot" className="mt-5 grid grid-cols-2 gap-x-5 border-t border-ink/10 lg:grid-cols-4 lg:gap-x-8">
          {snapshotIds.map((id) => {
            const section = adminSubsections.find((item) => item.id === id);
            if (!section) return null;
            return (
              <Link key={id} href={section.href} className="group flex min-h-32 flex-col justify-between border-b border-ink/10 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
                <span className="text-sm font-semibold text-ink group-hover:text-orange-700">{section.label}</span>
                <span aria-hidden="true" className="text-3xl leading-none text-stone-400">—</span>
                <span className="text-xs text-stone-600">No live total</span>
              </Link>
            );
          })}
        </nav>
      </section>

      <section aria-labelledby="areas-heading" className="mt-12 lg:mt-14">
        <div className="max-w-2xl">
          <h2 id="areas-heading" className="text-2xl font-medium">Workspace areas</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Each area has a place for its records and tools as the admin workspace grows.</p>
        </div>
        <div className="mt-7 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {workspaceGroups.map((group) => (
            <section key={group.title} aria-label={group.title}>
              <div className="border-t border-ink/10 pt-5">
                <h3 className="text-xl font-medium">{group.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-stone-600">{group.description}</p>
              </div>
              <div className="mt-3 border-t border-ink/10">
                {group.ids.map((id) => {
                  const section = adminSubsections.find((item) => item.id === id);
                  if (!section) return null;
                  return (
                    <Link key={id} href={section.href} className="group flex min-h-14 items-center justify-between gap-4 border-b border-ink/10 py-3 text-sm font-semibold text-ink hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
                      {section.label}<ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-700" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
