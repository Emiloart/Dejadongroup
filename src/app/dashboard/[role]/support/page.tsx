import { notFound, redirect } from "next/navigation";
import { ClientDashboardLayout } from "@/components/client-dashboard-layout";
import { CustomerSupportWorkspace } from "@/components/customer-support-workspace";
import { PartnerDashboardLayout } from "@/components/partner-dashboard-layout";
import { getCurrentClient } from "@/lib/client-auth";
import { getCurrentPartnerView } from "@/lib/partner-api";

export const dynamic = "force-dynamic";

export default async function DashboardSupportPage({ params: paramsPromise }: { params: Promise<{ role: string }> }) {
  const { role } = await paramsPromise;
  if (role === "client") {
    if (!await getCurrentClient()) redirect("/login?role=client&next=/dashboard/client/support");
    return <ClientDashboardLayout page="support"><CustomerSupportWorkspace role="client" /></ClientDashboardLayout>;
  }
  if (role === "partner") {
    const view = await getCurrentPartnerView();
    if (!view?.active) redirect("/login?role=partner&next=/dashboard/partner/support");
    return <PartnerDashboardLayout page="support"><CustomerSupportWorkspace role="partner" /></PartnerDashboardLayout>;
  }
  notFound();
}
