import { AdminShell } from "@/components/admin-shell";
import { AdminClientManager } from "@/components/admin-client-manager";
import { adminPage } from "@/lib/admin-access";
import { scopedClients } from "@/lib/admin-client-service";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const admin = await adminPage("agro.clients.read"); if (!admin) return null;
  return <AdminShell section="clients"><AdminClientManager initialClients={await scopedClients(admin)} /></AdminShell>;
}
