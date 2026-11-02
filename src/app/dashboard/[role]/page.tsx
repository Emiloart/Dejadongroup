import { notFound, redirect } from "next/navigation";
import { ClientDashboardLayout } from "@/components/client-dashboard-layout";
import { ClientServicesOverview } from "@/components/client-services-overview";
import { PartnerDashboardLayout } from "@/components/partner-dashboard-layout";
import { PartnerOverview } from "@/components/partner-overview";
import { getCurrentClient } from "@/lib/client-auth";
import { getCurrentPartnerView } from "@/lib/partner-api";
import { resourcesForPartner } from "@/lib/partner-resources";

export const dynamic = "force-dynamic";
export default async function DashboardPage({ params: paramsPromise }: { params: Promise<{ role: string }> }) {
  const params = await paramsPromise;
  if (params.role === "client") {
    const client = await getCurrentClient();
    if (!client) redirect("/login?role=client&next=/dashboard/client");
    return <ClientDashboardLayout page="overview"><ClientServicesOverview client={client} /></ClientDashboardLayout>;
  }
  if (params.role !== "partner") notFound();
  const view = await getCurrentPartnerView();
  if (!view?.active) redirect("/login?role=partner&next=/dashboard/partner");
  return <PartnerDashboardLayout page="overview"><PartnerOverview initialView={view} initialResources={await resourcesForPartner(view)} /></PartnerDashboardLayout>;
}
