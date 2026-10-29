import { randomUUID } from "node:crypto";
import { readCollection, updateCollection } from "@/lib/site-storage";
import { appendAudit } from "@/lib/admin-audit";
import { AdminError } from "@/lib/admin-store";
import { can, inScope, type AdminPrincipal } from "@/lib/admin-permissions";
import type { ClientDetails } from "@/lib/client-types";
export type ClientNote = { id: string; clientId: string; kind: "communication" | "verification"; detail: string; reference: string; at: string; actorId: string };
export const clientNotes = () => readCollection<ClientNote>("client-notes");
export async function manageClientRecords(admin: AdminPrincipal, input: Record<string, unknown>) {
  const id = String(input.clientId || ""); if (!inScope(admin, "clients", id)) throw new AdminError("Client not found.", 404);
  const client = (await readCollection<ClientDetails>("clients")).find((item) => item.id === id); if (!client) throw new AdminError("Client not found.", 404);
  if (input.action === "note") {
    if (!can(admin, "agro.clients.manage")) throw new AdminError("Client management permission is required.", 403);
    if ((input.kind !== "communication" && input.kind !== "verification") || typeof input.detail !== "string" || !input.detail.trim() || input.detail.length > 3000 || typeof input.reference !== "string" || input.reference.length > 200) throw new AdminError("Check the note type, details and reference.");
    const note: ClientNote = { id: randomUUID(), clientId: id, kind: input.kind, detail: input.detail.trim(), reference: input.reference, at: new Date().toISOString(), actorId: admin.id };
    await updateCollection<ClientNote, void>("client-notes", (items) => ({ items: [...items, note], result: undefined }));
    await appendAudit({ action: `client.${note.kind}.recorded`, resource: "client", resourceId: id, after: { noteId: note.id, kind: note.kind, reference: note.reference } }); return note;
  }
  if (!can(admin, "agro.clients.activate")) throw new AdminError("Client access permission is required.", 403);
  if (input.confirm !== true || typeof input.reason !== "string" || input.reason.trim().length < 5 || !["active", "suspended", "revoked"].includes(String(input.status))) throw new AdminError("Choose an access state, confirm and enter a reason.");
  return updateCollection<ClientDetails & { sessions: unknown[]; tokenHash: string | null }, { clientId: string; status: string }>("clients", async (items) => {
    const record = items.find((item) => item.id === id)!;
    if (input.status === "active" && !record.verified) throw new AdminError("Verify client information before restoring access.");
    const previous = record.accessStatus || "active"; record.accessStatus = input.status as ClientDetails["accessStatus"]; record.sessions = []; record.tokenHash = null; record.updatedAt = new Date().toISOString();
    await appendAudit({ action: "client.access.changed", resource: "client", resourceId: id, before: { status: previous }, after: { status: record.accessStatus }, reason: input.reason as string });
    return { items, result: { clientId: id, status: record.accessStatus! } };
  });
}
