import { adminNotifications } from "@/lib/admin-notifications";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { adminSections } from "@/lib/admin-data";
import { currentAdmin } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
export default async function AdminOverviewPage() {
  const admin = await currentAdmin(); if (!admin) return null;
  const alerts = await adminNotifications(admin);
  const sections = adminSections.filter((section) => section.permission && can(admin, section.permission));
  return <AdminShell section="overview"><h1 className="text-4xl">Welcome, {admin.name}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">Your workspaces reflect your current permissions and assigned records. Changes to access take effect on every request.</p><section aria-label="Operational notifications" className="mt-7 rounded-card border border-ink/10 bg-white p-6"><h2 className="text-xl">Needs attention</h2>{alerts.length ? <ul className="mt-4 space-y-3">{alerts.map((alert) => <li key={alert.title}><Link href={alert.href} className="text-sm font-semibold text-orange-700">{alert.count} · {alert.title}</Link></li>)}</ul> : <p className="mt-3 text-sm text-stone-500">No current operational alerts within your access.</p>}</section><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{sections.map((section) => <Link href={section.href} key={section.id} className="rounded-card border border-ink/10 bg-white p-6 hover:border-orange-700"><p className="text-xs text-orange-700">{section.department}</p><h2 className="mt-3 text-xl">{section.label}</h2><p className="mt-3 text-sm leading-7 text-stone-600">{section.description}</p></Link>)}</div>{!sections.length ? <p className="mt-8">No department access is assigned. Contact the Super Admin.</p> : null}</AdminShell>;
}
