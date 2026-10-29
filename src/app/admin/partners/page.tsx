import { AdminShell } from "@/components/admin-shell";
import { AdminPartnerProgramme } from "@/components/admin-partner-programme";
import { isAdminAuthenticated, isSuperAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminPartnerProgramme } from "@/lib/partner-store";
import { serviceConfiguration } from "@/lib/partner-services";

export const dynamic = "force-dynamic";
export default async function AdminPartnersPage() {
  if (!isAdminAuthenticated()) return null;
  if (!isSuperAdminAuthenticated()) return <AdminShell section="partners"><h1 className="text-3xl">Super Admin access required</h1><p className="mt-4 text-sm leading-7 text-stone-600">Only the Super Admin can manage partner tiers, promo codes and programme payments.</p></AdminShell>;
  return <AdminShell section="partners"><AdminPartnerProgramme initialData={{ ...await getAdminPartnerProgramme(), services: serviceConfiguration() }} /></AdminShell>;
}
