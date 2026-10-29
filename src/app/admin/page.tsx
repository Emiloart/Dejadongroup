import Link from "next/link";
import { ArrowUpRight, Package, Plus } from "lucide-react";
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
        <p className="mt-4 text-sm leading-7 text-stone-600">Keep your marketplace up to date and find the tools for your day-to-day operations.</p>
      </div>

      <section aria-labelledby="marketplace-management-heading" className="mt-10 rounded-card border border-ink/10 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
        <div>
          <Package aria-hidden="true" className="h-6 w-6 text-orange-700" />
          <h2 id="marketplace-management-heading" className="mt-4 text-2xl font-medium">Your marketplace</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">Add product photos, prices, and details. Save drafts while you prepare, then publish products for customers to browse.</p>
        </div>
        <Link href="/admin/products" className="mt-6 inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-card bg-ink px-5 text-sm font-semibold text-white hover:bg-stone-700 sm:mt-0"><Plus aria-hidden="true" className="h-4 w-4" /> Manage products</Link>
      </section>

      <section aria-label="Publishing and subscribers" className="mt-6 grid gap-5 sm:grid-cols-2">
        {[{ href: "/admin/news", title: "Blog & news", description: "Add a link to publish its original image and excerpt in the four-slide homepage carousel.", label: "Manage articles" }, { href: "/admin/newsletter", title: "Newsletter", description: "View newsletter signups and export subscribers for your email campaigns.", label: "Manage subscribers" }].map((item) => <Link key={item.href} href={item.href} className="group rounded-card border border-ink/10 bg-white p-6"><h2 className="text-2xl group-hover:text-orangeAction">{item.title}</h2><p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p><span className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-orange-700">{item.label}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></span></Link>)}
      </section>

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
