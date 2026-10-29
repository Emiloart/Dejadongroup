import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { adminSubsections } from "@/lib/admin-data";
import { adminPage } from "@/lib/admin-access";
import { AdminUsers, AdminAudit, AdminSettings } from "@/components/admin-governance";
import { AdminFinance } from "@/components/admin-finance";
import { AdminContentWorkspace } from "@/components/admin-content-workspace";
import { AdminClientRecords } from "@/components/admin-client-records";
export const dynamic = "force-dynamic";
export default async function AdminSectionPage({ params }: { params: { section: string } }) {
  const section = adminSubsections.find((item) => item.id === params.section); if (!section || !section.permission) notFound();
  const admin = await adminPage(section.permission); if (!admin) return null;
  return <AdminShell section={section.id}>{section.id === "users" ? <AdminUsers actorId={admin.id} /> : section.id === "audit" ? <AdminAudit /> : section.id === "settings" ? <AdminSettings /> : section.id === "content" ? <AdminContentWorkspace permissions={admin.permissions} /> : section.id === "client-records" ? <AdminClientRecords permissions={admin.permissions} /> : <AdminFinance permissions={admin.permissions} />}</AdminShell>;
}
