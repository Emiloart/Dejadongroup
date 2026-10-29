import { getAdminClients, issueClientToken, saveClientRecord } from "@/lib/client-store";
import { can, inScope, type AdminPrincipal } from "@/lib/admin-permissions";
import { AdminError } from "@/lib/admin-store";
import { audited } from "@/lib/admin-audit";
export async function scopedClients(admin: AdminPrincipal) { return (await getAdminClients()).filter((client) => inScope(admin, "clients", client.id)); }
export async function saveAdminClient(admin: AdminPrincipal, input: Record<string, unknown>, id?: string) {
  if (!can(admin, id ? "agro.clients.manage" : "agro.clients.create")) throw new AdminError("Client management permission is required.", 403);
  if (id && !inScope(admin, "clients", id)) throw new AdminError("Client not found.", 404);
  if (!id && admin.scope.clients !== "all") throw new AdminError("Client creation requires access to all client records.", 403);
  const before = id ? (await getAdminClients()).find((client) => client.id === id) : undefined;
  if (id && !before) throw new AdminError("Client not found.", 404);
  if (before && !can(admin, "agro.properties.manage") && ["propertyName", "propertyLocation", "propertyReference"].some((key) => input[key] !== before[key as keyof typeof before])) throw new AdminError("Property management permission is required.", 403);
  if (before && !can(admin, "agro.investments.manage") && ["investmentName", "investmentDetails", "investmentProgress", "actualDateLabel", "actualDate", "processes"].some((key) => JSON.stringify(input[key]) !== JSON.stringify(before[key as keyof typeof before]))) throw new AdminError("Investment management permission is required.", 403);
  const balance = input.balance === "" || input.balance === undefined || input.balance === null ? null : Number(input.balance);
  if (balance !== (before?.balance ?? null)) throw new AdminError("Use Finance → Manual balance adjustment to record a balance with its reason and reference.");
  const withdrawals = input.withdrawals ?? [];
  if (!Array.isArray(withdrawals)) throw new AdminError("Check the withdrawal records.");
  if (!can(admin, "agro.withdrawals.review") && JSON.stringify(withdrawals) !== JSON.stringify(before?.withdrawals || [])) throw new AdminError("Withdrawal review permission is required.", 403);
  const sameWithdrawal = (a: typeof withdrawals[number], b: typeof withdrawals[number]) => JSON.stringify({ id: a.id, amount: Number(a.amount), date: a.date, reference: a.reference || "", note: a.note || "", status: a.status }) === JSON.stringify({ id: b.id, amount: Number(b.amount), date: b.date, reference: b.reference || "", note: b.note || "", status: b.status });
  for (const withdrawal of withdrawals) {
    const prior = before?.withdrawals.find((item) => item.id === withdrawal.id);
    if (!prior && withdrawal.status !== "pending" || prior && (withdrawal.status !== prior.status || prior.status !== "pending" && !sameWithdrawal(withdrawal, prior))) throw new AdminError("Withdrawal statuses are controlled by the Finance review workflow.");
  }
  for (const prior of before?.withdrawals || []) if (!withdrawals.some((item) => item.id === prior.id)) throw new AdminError("Withdrawal records must be retained for review.");
  // Once reviewed, amount/reference changes must go through a new request.
  const { withdrawalHasReview } = await import("@/lib/finance-store");
  for (const withdrawal of withdrawals) { const prior = before?.withdrawals.find((item) => item.id === withdrawal.id); if (prior && await withdrawalHasReview(id!, prior.id) && !sameWithdrawal(prior, withdrawal)) throw new AdminError("A reviewed withdrawal cannot be edited. Record a new request.", 409); }
  return audited(id ? "client.updated" : "client.created", "client", id || "new", () => saveClientRecord(input, id), before);
}
export const adminClientToken = (id: string, revoke: boolean) => audited(revoke ? "client.token.revoked" : "client.token.issued", "client", id, () => issueClientToken(id, revoke));
