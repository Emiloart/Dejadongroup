import { AdminShell } from "@/components/admin-shell";
import { AdminClientManager } from "@/components/admin-client-manager";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminClients } from "@/lib/client-store";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  if (!isAdminAuthenticated()) return null;
  return <AdminShell section="clients"><AdminClientManager initialClients={await getAdminClients()} /></AdminShell>;
}
