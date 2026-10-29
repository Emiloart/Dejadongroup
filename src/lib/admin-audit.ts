import { AsyncLocalStorage } from "node:async_hooks";
import { createHash, randomUUID } from "node:crypto";
import { readCollection, updateCollection, storageTransaction } from "@/lib/site-storage";
export type AuditEvent = { id: string; actorId: string; action: string; resource: string; resourceId: string; at: string; outcome: "success" | "denied" | "failed"; correlationId: string; reason: string; before?: unknown; after?: unknown; previousHash: string; hash: string };
type ActorContext = { actorId: string; correlationId: string };
const global = globalThis as typeof globalThis & { dejadonAuditContext?: AsyncLocalStorage<ActorContext> };
const context = global.dejadonAuditContext ||= new AsyncLocalStorage<ActorContext>();
export const withAuditActor = <T>(actorId: string, correlationId: string, operation: () => Promise<T>) => context.run({ actorId, correlationId }, operation);
const secret = /password|salt|hash|token|secret|session|otp|accountnumber|email|phone|fullname|photo|dob|nationality|eligibleemails|customer|location|occupation/i;
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 7) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redact(item, depth + 1));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, secret.test(key) ? "[redacted]" : redact(item, depth + 1)]));
  return typeof value === "string" ? value.slice(0, 1000) : value;
}
export async function appendAudit(event: Partial<Pick<AuditEvent, "actorId" | "outcome" | "correlationId" | "reason" | "before" | "after">> & Pick<AuditEvent, "action" | "resource" | "resourceId">) {
  return updateCollection<AuditEvent, void>("audit", (items) => {
    const base = { id: randomUUID(), actorId: event.actorId || context.getStore()?.actorId || "system", action: event.action, resource: event.resource, resourceId: event.resourceId,
      at: new Date().toISOString(), outcome: event.outcome || "success", correlationId: event.correlationId || context.getStore()?.correlationId || randomUUID(), reason: event.reason?.slice(0, 1000) || "",
      before: redact(event.before), after: redact(event.after), previousHash: items.at(-1)?.hash || "genesis" };
    const hash = createHash("sha256").update(JSON.stringify(base)).digest("hex");
    return { items: [...items, { ...base, hash }], result: undefined };
  });
}
export async function audited<T>(action: string, resource: string, resourceId: string, operation: () => Promise<T>, before?: unknown, reason?: string) {
  return storageTransaction(async () => { const result = await operation();
    const created = result && typeof result === "object" ? result as Record<string, unknown> : null;
    const resolvedId = resourceId === "new" && created ? String(created.id || created.slug || resourceId) : resourceId;
    await appendAudit({ action, resource, resourceId: resolvedId, before, after: result, reason }); return result; });
}
export const auditHistory = () => readCollection<AuditEvent>("audit");
