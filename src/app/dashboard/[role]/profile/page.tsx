import { notFound, redirect } from "next/navigation";
import { ClientDashboardLayout } from "@/components/client-dashboard-layout";
import { ClientProfileEditor } from "@/components/client-profile-editor";
import { PartnerDashboardLayout } from "@/components/partner-dashboard-layout";
import { PartnerProfile } from "@/components/partner-profile";
import { getCurrentClient } from "@/lib/client-auth";
import { getCurrentPartnerView } from "@/lib/partner-api";

export const dynamic = "force-dynamic";
export default async function ProfilePage({ params }: { params: { role: string } }) {
  if (params.role === "client") {
    const client = await getCurrentClient();
    if (!client) redirect("/login?role=client&next=/dashboard/client/profile");
    return <ClientDashboardLayout page="profile"><ClientProfileEditor client={client} /></ClientDashboardLayout>;
  }
  if (params.role !== "partner") notFound();
  const view = await getCurrentPartnerView();
  if (!view?.active) redirect("/login?role=partner&next=/dashboard/partner/profile");
  return <PartnerDashboardLayout page="profile"><PartnerProfile initialPartner={view.partner} /></PartnerDashboardLayout>;
}
