import { notFound, redirect } from "next/navigation";
import { ClientDashboardLayout } from "@/components/client-dashboard-layout";
import { ClientOverview } from "@/components/client-overview";
import { ClientSavings } from "@/components/client-savings";
import { getCurrentClient } from "@/lib/client-auth";
import { requireClientService } from "@/lib/client-services";
import { clientServices, servicePaths } from "@/lib/savings-types";
import { clientSavingsView } from "@/lib/savings-store";
import { AdminError } from "@/lib/admin-store";
export const dynamic = "force-dynamic";
export default async function ClientServicePage({ params }: { params: { role: string; section: string } }) {
  if (params.role !== "client") notFound();
  const service = clientServices.find((item) => servicePaths[item] === params.section); if (!service) notFound();
  const client = await getCurrentClient(); if (!client) redirect(`/login?role=client&next=/dashboard/client/${params.section}`);
  try { await requireClientService(client.id, service); } catch (error) { if (error instanceof AdminError && error.status === 404) notFound(); throw error; }
  return <ClientDashboardLayout page={service}>{service === "agro_real_estate" ? <ClientOverview client={client} /> : <ClientSavings initialView={await clientSavingsView(client.id, service)} />}</ClientDashboardLayout>;
}
