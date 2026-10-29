import { createHash, randomUUID } from "node:crypto";
import { readCollection, updateCollection } from "@/lib/site-storage";
import { appendAudit } from "@/lib/admin-audit";
import { AdminError, refreshActiveAdmin } from "@/lib/admin-store";
import { can, inScope, type AdminPrincipal, type Permission } from "@/lib/admin-permissions";
import { readAdministration } from "@/lib/admin-store";
import { readProgramme } from "@/lib/partner-store";
import { publicPartnerPayment } from "@/lib/partner-types";
import type { ClientDetails } from "@/lib/client-types";
export type FinanceOperation = { id: string; kind: "balance" | "withdrawal" | "refund-retry"; clientId: string; withdrawalId: string; reference: string; amountKobo: number; previousKobo: number | null; fingerprint: string; reason: string; initiatorId: string; reviewerId: string | null; approvedBy: string | null; state: "review" | "approved" | "rejected" | "executing" | "executed" | "failed"; createdAt: string; updatedAt: string; result: string };
export const financeOperations = () => readCollection<FinanceOperation>("finance");
export const withdrawalHasReview = async (clientId: string, withdrawalId: string) => (await financeOperations()).some((item) => item.kind === "withdrawal" && item.clientId === clientId && item.withdrawalId === withdrawalId);
export function kobo(value: unknown) { const text = String(value ?? ""); if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(text)) throw new AdminError("Enter an NGN amount with up to two decimal places."); const [whole, fraction = ""] = text.split("."); return Number(whole) * 100 + Number(fraction.padEnd(2, "0")); }
const fingerprint = (data: unknown) => createHash("sha256").update(JSON.stringify(data)).digest("hex");
function reason(input: Record<string, unknown>) { if (input.confirm !== true || typeof input.reason !== "string" || input.reason.trim().length < 5 || input.reason.length > 1000) throw new AdminError("Confirm the operation and enter a reason of 5–1000 characters."); return input.reason.trim(); }
function requirePermission(admin: AdminPrincipal, permission: Permission) { if (!can(admin, permission)) throw new AdminError("You do not have permission for this financial action.", 403); }
async function clientWithdrawal(admin: AdminPrincipal, clientId: string, withdrawalId: string) {
  if (!inScope(admin, "clients", clientId)) throw new AdminError("Client not found.", 404);
  const client = (await readCollection<ClientDetails>("clients")).find((client) => client.id === clientId);
  const withdrawal = client?.withdrawals.find((item) => item.id === withdrawalId);
  if (!client || !withdrawal) throw new AdminError("Withdrawal not found.", 404);
  return { client, withdrawal };
}
export async function initiateFinance(admin: AdminPrincipal, input: Record<string, unknown>) {
  const justification = reason(input); const kind = input.kind;
  if (kind !== "balance" && kind !== "withdrawal" && kind !== "refund-retry") throw new AdminError("Choose a supported financial operation.");
  requirePermission(admin, kind === "balance" ? "finance.balances.manage" : kind === "withdrawal" ? "agro.withdrawals.review" : "finance.refunds.review");
  let amountKobo = 0; let previousKobo: number | null = null; let snapshot: unknown;
  const clientId = String(input.clientId || ""); const withdrawalId = String(input.withdrawalId || ""); const reference = String(input.reference || "").trim();
  if (reference.length < 3 || reference.length > 120) throw new AdminError("Enter a supporting reference of 3–120 characters.");
  if (kind === "balance") {
    if (!inScope(admin, "clients", clientId)) throw new AdminError("Client not found.", 404);
    const client = (await readCollection<ClientDetails>("clients")).find((item) => item.id === clientId);
    if (!client) throw new AdminError("Client not found.", 404);
    amountKobo = kobo(input.amount); previousKobo = client.balance === null ? null : kobo(client.balance);
    snapshot = { clientId, previousKobo, amountKobo, reference };
  } else if (kind === "withdrawal") {
    const { withdrawal } = await clientWithdrawal(admin, clientId, withdrawalId);
    if (withdrawal.status !== "pending") throw new AdminError("Only pending requests can enter review.", 409);
    amountKobo = kobo(withdrawal.amount); snapshot = { clientId, withdrawal };
  } else {
    const payment = (await readProgramme()).payments.find((item) => item.reference === reference && inScope(admin, "partners", item.partnerId));
    if (!payment) throw new AdminError("Payment not found.", 404);
    if (!payment.refundKobo || !["failed", "uncertain", "needs-attention"].includes(payment.refundStatus) || payment.refundKobo > (payment.receivedKobo ?? 0)) throw new AdminError("This payment has no eligible failed or uncertain refund to retry.", 409);
    amountKobo = payment.refundKobo; snapshot = { reference, amountKobo, transactionId: payment.transactionId };
  }
  return updateCollection<FinanceOperation, FinanceOperation>("finance", async (items) => {
    if (items.some((item) => item.reference === reference && item.kind === kind && (kind !== "withdrawal" || item.withdrawalId === withdrawalId) && !["rejected", "failed"].includes(item.state))) throw new AdminError("This operation already exists. Review the existing record.", 409);
    if (kind === "withdrawal" && items.some((item) => item.clientId === clientId && item.withdrawalId === withdrawalId)) throw new AdminError("This withdrawal already has a review record.", 409);
    const now = new Date().toISOString();
    const operation: FinanceOperation = { id: randomUUID(), kind, clientId, withdrawalId, reference, amountKobo, previousKobo, fingerprint: fingerprint(snapshot), reason: justification, initiatorId: admin.id, reviewerId: null, approvedBy: null, state: "review", createdAt: now, updatedAt: now, result: "" };
    await appendAudit({ action: `finance.${kind}.requested`, resource: kind, resourceId: operation.id, after: operation, reason: justification });
    return { items: [...items, operation], result: operation };
  });
}
export async function actOnFinance(admin: AdminPrincipal, input: Record<string, unknown>) {
  const justification = reason(input);
  const candidate = (await financeOperations()).find((item) => item.id === input.id);
  if (candidate?.kind === "refund-retry" && input.action === "execute") {
    requirePermission(admin, "finance.refunds.execute");
    const claimed = await updateCollection<FinanceOperation, FinanceOperation>("finance", async (items) => {
      admin = await refreshActiveAdmin(admin);
      requirePermission(admin, "finance.refunds.execute");
      const operation = items.find((item) => item.id === input.id)!;
      const payment = (await readProgramme()).payments.find((item) => item.reference === operation.reference);
      if (!payment || !inScope(admin, "partners", payment.partnerId)) throw new AdminError("Operation not found.", 404);
      if (operation.state === "executed") return { items, result: operation };
      if (!operation.approvedBy || !["approved", "executing"].includes(operation.state)) throw new AdminError("Approve this exact operation before execution.", 409);
      if ((await readAdministration()).requireSecondApproval && operation.approvedBy === operation.initiatorId) throw new AdminError("Current policy requires an independent approval. Create a new request.", 409);
      if (operation.state === "executing" && Date.now() - Date.parse(operation.updatedAt) < 120000) throw new AdminError("This refund retry is already running.", 409);
      if (fingerprint({ reference: payment.reference, amountKobo: payment.refundKobo, transactionId: payment.transactionId }) !== operation.fingerprint || payment.refundKobo > (payment.receivedKobo ?? 0)) throw new AdminError("Refund terms changed. Create a new review request.", 409);
      operation.state = "executing"; operation.updatedAt = new Date().toISOString();
      await appendAudit({ action: "finance.refund-retry.claimed", resource: "refund", resourceId: operation.id, after: operation, reason: justification });
      return { items, result: operation };
    });
    if (claimed.state === "executed") return claimed;
    let failure = "";
    try { const { processPartnerRefund } = await import("@/lib/partner-payments"); await processPartnerRefund(claimed.reference, true); }
    catch { failure = "The provider request could not be confirmed; reconcile before retrying."; }
    const payment = (await readProgramme()).payments.find((item) => item.reference === claimed.reference)!;
    return updateCollection<FinanceOperation, FinanceOperation>("finance", async (items) => {
      const operation = items.find((item) => item.id === claimed.id)!;
      operation.state = !failure && ["pending", "processing", "processed"].includes(payment.refundStatus) ? "executed" : "failed";
      operation.result = failure || `Provider refund state: ${payment.refundStatus}. Settlement remains provider-confirmed.`;
      operation.updatedAt = new Date().toISOString();
      await appendAudit({ action: "finance.refund-retry.result", resource: "refund", resourceId: operation.id, after: operation, outcome: operation.state === "failed" ? "failed" : "success", reason: justification });
      return { items, result: operation };
    });
  }
  return updateCollection<FinanceOperation, FinanceOperation>("finance", async (items) => {
    admin = await refreshActiveAdmin(admin);
    const operation = items.find((item) => item.id === input.id);
    if (!operation || operation.clientId && !inScope(admin, "clients", operation.clientId)) throw new AdminError("Operation not found.", 404);
    if (operation.kind === "refund-retry") { const payment = (await readProgramme()).payments.find((item) => item.reference === operation.reference); if (!payment || !inScope(admin, "partners", payment.partnerId)) throw new AdminError("Operation not found.", 404); }
    const before = { ...operation };
    const action = input.action;
    const approvalPermission = operation.kind === "withdrawal" ? "finance.withdrawals.approve" : operation.kind === "balance" ? "finance.balances.manage" : "finance.refunds.review";
    if (action === "approve" || action === "reject") {
      requirePermission(admin, approvalPermission);
      if (operation.state !== "review") throw new AdminError("This operation has already been reviewed.", 409);
      if ((await readAdministration()).requireSecondApproval && operation.initiatorId === admin.id) throw new AdminError("A different authorized administrator must review this request.", 403);
      operation.reviewerId = admin.id; operation.approvedBy = action === "approve" ? admin.id : null; operation.state = action === "approve" ? "approved" : "rejected";
      operation.result = justification;
    } else if (action === "execute") {
      requirePermission(admin, operation.kind === "withdrawal" ? "finance.withdrawals.execute" : operation.kind === "balance" ? "finance.balances.manage" : "finance.refunds.execute");
      if (operation.state === "executed") return { items, result: operation };
      if (operation.state !== "approved" || !operation.approvedBy) throw new AdminError("Approve this exact operation before execution.", 409);
      if ((await readAdministration()).requireSecondApproval && operation.approvedBy === operation.initiatorId) throw new AdminError("Current policy requires an independent approval.", 409);
      if (operation.kind === "withdrawal") throw new AdminError("Payout execution is unavailable: no transfer provider, recipient verification or settlement integration is configured. Approval does not mean paid.", 409);
      if (operation.kind === "balance") {
        await updateCollection<ClientDetails, void>("clients", (clients) => {
          const client = clients.find((client) => client.id === operation.clientId);
          if (!client || fingerprint({ clientId: client.id, previousKobo: client.balance === null ? null : kobo(client.balance), amountKobo: operation.amountKobo, reference: operation.reference }) !== operation.fingerprint) throw new AdminError("The balance changed after this request. Create a new adjustment.", 409);
          client.balance = operation.amountKobo / 100; client.updatedAt = new Date().toISOString();
          return { items: clients, result: undefined };
        });
        operation.result = "Manual balance recorded; this operation does not represent a bank transfer.";
      } else throw new AdminError("Use the approved refund execution workflow.", 409);
      operation.state = "executed";
    } else throw new AdminError("Choose approve, reject or execute.");
    operation.updatedAt = new Date().toISOString();
    await appendAudit({ action: `finance.${operation.kind}.${action}`, resource: operation.kind, resourceId: operation.id, before, after: operation, reason: justification });
    return { items, result: operation };
  });
}
export async function financeView(admin: AdminPrincipal) {
  requirePermission(admin, "finance.transactions.read");
  const programme = await readProgramme();
  return {
    payments: programme.payments.filter((payment) => inScope(admin, "partners", payment.partnerId)).slice().reverse().map((payment) => ({ ...publicPartnerPayment(payment), registrationFeeKobo: payment.baseKobo - payment.discountKobo, refundableVerificationFeeKobo: payment.verificationFeeKobo })),
    entries: programme.payments.filter((payment) => inScope(admin, "partners", payment.partnerId)).flatMap((payment) => {
      const common = { reference: payment.reference, currency: "NGN", providerMode: payment.providerMode, createdAt: payment.paidAt || payment.createdAt };
      const entries: { id: string; kind: string; amountKobo: number; direction: string; status: string; reference: string; currency: string; providerMode: string; createdAt: string }[] = [];
      if (payment.status === "paid") {
        entries.push({ ...common, id: `${payment.reference}:registration`, kind: payment.kind, amountKobo: payment.baseKobo - payment.discountKobo, direction: "receipt", status: "confirmed" });
        if (payment.verificationFeeKobo) entries.push({ ...common, id: `${payment.reference}:verification`, kind: "refundable-verification-fee", amountKobo: payment.verificationFeeKobo, direction: "receipt", status: "confirmed" });
      } else if (payment.receivedKobo !== null && payment.receivedKobo > 0) entries.push({ ...common, id: `${payment.reference}:unallocated`, kind: "unallocated-receipt", amountKobo: payment.receivedKobo, direction: "receipt", status: payment.status });
      if (payment.refundKobo) entries.push({ ...common, id: `${payment.reference}:refund`, kind: "linked-refund", amountKobo: payment.refundKobo, direction: "refund", status: payment.refundStatus });
      return entries;
    }),
    operations: (await financeOperations()).filter((item) => (!item.clientId || inScope(admin, "clients", item.clientId)) && (item.kind !== "refund-retry" || programme.payments.some((payment) => payment.reference === item.reference && inScope(admin, "partners", payment.partnerId)))).reverse(),
    payoutExecutionAvailable: false, commissionLedgerAvailable: false
  };
}
