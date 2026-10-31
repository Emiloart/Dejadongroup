import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataDirectory, readCollection, updateCollection, storageTransaction } from "@/lib/site-storage";
import { appendAudit } from "@/lib/admin-audit";
import { AdminError } from "@/lib/admin-store";
import { can, inScope, type AdminPrincipal } from "@/lib/admin-permissions";
import type { ClientDetails } from "@/lib/client-types";
import { clientServices, type ClientService, type ServiceAssignment, type RecordEvent } from "@/lib/savings-types";

export const recordEvent = (actorId: string, action: string, reason: string): RecordEvent => ({ id: randomUUID(), at: new Date().toISOString(), actorId, action, reason });
function newAssignment(clientId: string, service: ClientService, actorId: string, reason: string): ServiceAssignment {
  const event = recordEvent(actorId, "enabled", reason);
  return { id: randomUUID(), clientId, service, status: "enabled", createdAt: event.at, updatedAt: event.at, createdBy: actorId, updatedBy: actorId, history: [event] };
}
export async function migrateClientServices() {
  return storageTransaction(async () => {
    if ((await readCollection<{ version: number }>("migrations")).some((item) => item.version === 3)) return { applied: false, backup: null as string | null };
    const directory = dataDirectory(); await mkdir(directory, { recursive: true, mode: 0o700 });
    const backup = path.join(directory, "migration-backups", `client-services-v3-${Date.now()}`);
    await mkdir(backup, { recursive: true, mode: 0o700 });
    for (const name of await readdir(directory)) if (/^[a-z][a-z-]*\.json$/.test(name) && name !== "journal.json") await writeFile(path.join(backup, name), await readFile(path.join(directory, name)), { mode: 0o600 });
    const clients = await readCollection<ClientDetails>("clients"); let added = 0;
    await updateCollection<ServiceAssignment, void>("client-services", async (items) => {
      for (const client of clients) if (!items.some((item) => item.clientId === client.id && item.service === "agro_real_estate")) {
        const assignment = newAssignment(client.id, "agro_real_estate", "system:migration-v3", "Preserve existing Agro-Real Estate access."); items.push(assignment); added++;
        await appendAudit({ actorId: "system:migration-v3", action: "client.service.backfilled", resource: "client-service", resourceId: assignment.id, after: assignment });
      }
      return { items, result: undefined };
    });
    await updateCollection<{ version: number; appliedAt?: string; assignments?: number }, void>("migrations", (items) => ({ items: [...items, { version: 3, appliedAt: new Date().toISOString(), assignments: added }], result: undefined }));
    await appendAudit({ actorId: "system:migration-v3", action: "migration.client-services-v3", resource: "migration", resourceId: "3", after: { assignments: added } });
    return { applied: true, backup };
  });
}
export async function serviceAssignments(clientId?: string) {
  await migrateClientServices();
  return (await readCollection<ServiceAssignment>("client-services")).filter((item) => !clientId || item.clientId === clientId);
}
export async function requireClientService(clientId: string, service: ClientService) {
  const assignment = (await serviceAssignments(clientId)).find((item) => item.service === service && item.status === "enabled");
  if (!assignment) throw new AdminError("Service not found.", 404);
  return assignment;
}
/** Identity/profile responses must not become a back door into a suspended service. */
export async function visibleClientDetails(client: ClientDetails): Promise<ClientDetails> {
  const agro = (await serviceAssignments(client.id)).some((item) => item.service === "agro_real_estate" && item.status === "enabled");
  return agro ? client : { ...client, propertyName: "", propertyLocation: "", propertyReference: "", investmentName: "", investmentDetails: "", investmentProgress: 0, actualDateLabel: "Actual Date", actualDate: "", balance: null, processes: [], withdrawals: [] };
}
export async function assignInitialAgro(clientId: string, actorId: string) {
  await migrateClientServices();
  return updateCollection<ServiceAssignment, void>("client-services", async (items) => {
    if (!items.some((item) => item.clientId === clientId && item.service === "agro_real_estate")) {
      const assignment = newAssignment(clientId, "agro_real_estate", actorId, "Initial Agro-Real Estate client registration."); items.push(assignment);
      await appendAudit({ actorId, action: "client.service.assigned", resource: "client-service", resourceId: assignment.id, after: assignment });
    }
    return { items, result: undefined };
  });
}
export async function manageServiceAssignment(admin: AdminPrincipal, input: Record<string, unknown>) {
  if (!can(admin, "clients.services.manage")) throw new AdminError("Service assignment permission is required.", 403);
  const clientId = String(input.clientId || "");
  if (!inScope(admin, "clients", clientId) || !(await readCollection<ClientDetails>("clients")).some((client) => client.id === clientId)) throw new AdminError("Client not found.", 404);
  if (!clientServices.includes(input.service as ClientService)) throw new AdminError("Choose a supported service.");
  if (!["enabled", "suspended", "inactive"].includes(String(input.status))) throw new AdminError("Choose a supported assignment status.");
  if (typeof input.reason !== "string" || input.reason.trim().length < 5 || input.reason.length > 1000) throw new AdminError("Enter a reason of 5–1000 characters.");
  await migrateClientServices();
  return updateCollection<ServiceAssignment, ServiceAssignment>("client-services", async (items) => {
    let assignment = items.find((item) => item.clientId === clientId && item.service === input.service); const before = assignment ? structuredClone(assignment) : undefined;
    if (!assignment) {
      if (input.status !== "enabled") throw new AdminError("Enable the service before changing its access.", 409);
      assignment = newAssignment(clientId, input.service as ClientService, admin.id, input.reason as string); items.push(assignment);
    } else {
      if (assignment.status === input.status) throw new AdminError("This assignment already has that status.", 409);
      if (assignment.status === "inactive" && input.status === "suspended") throw new AdminError("Enable an inactive assignment before suspending it.", 409);
      assignment.status = input.status as ServiceAssignment["status"]; assignment.updatedAt = new Date().toISOString(); assignment.updatedBy = admin.id;
      assignment.history.push(recordEvent(admin.id, assignment.status, input.reason as string));
    }
    await appendAudit({ actorId: admin.id, action: `client.service.${before ? "updated" : "assigned"}`, resource: "client-service", resourceId: assignment.id, before, after: assignment, reason: input.reason as string });
    return { items, result: assignment };
  });
}
