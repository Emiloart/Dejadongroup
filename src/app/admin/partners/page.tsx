import { AdminShell } from "@/components/admin-shell";
import { AdminPartnerProgramme } from "@/components/admin-partner-programme";
import { adminPage } from "@/lib/admin-access";
import { scopedProgramme } from "@/lib/admin-partner-service";
import { serviceConfiguration } from "@/lib/partner-services";

export const dynamic = "force-dynamic";
export default async function AdminPartnersPage() {
  const admin = await adminPage("partners.read"); if (!admin) return null;
  return <AdminShell section="partners"><AdminPartnerProgramme permissions={admin.permissions} initialData={{ ...await scopedProgramme(admin), services: serviceConfiguration() }} /></AdminShell>;
}
