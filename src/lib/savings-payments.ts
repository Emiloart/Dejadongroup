import { randomUUID } from "node:crypto";
import { appendAudit } from "@/lib/admin-audit";
import { AdminError } from "@/lib/admin-store";
import { readCollection, updateCollection, storageTransaction } from "@/lib/site-storage";
import { appBaseUrl, paystack } from "@/lib/partner-services";
import { requireClientService } from "@/lib/client-services";
import { ownSavingsAccount, savingsTotals } from "@/lib/savings-store";
import { servicePaths, type FinanceLedgerEntry, type SavingsPayment } from "@/lib/savings-types";
import type { ClientDetails } from "@/lib/client-types";

export const isSavingsReference = (reference: string) => /^DJ-SAVE-[a-f0-9-]{36}$/.test(reference);
function requireTestProvider(collection = false) {
  if (!process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_test_") || collection && process.env.SAVINGS_PAYMENTS_MODE !== "test") throw new AdminError("Savings collection is unavailable. Live payments require an approved custody arrangement and final terms; only an explicitly configured test environment is supported.", 503);
}
export async function initiateSavingsPayment(clientId: string, accountId: string) {
  requireTestProvider(true); const base = appBaseUrl();
  const payment = await storageTransaction(async () => {
    const account = await ownSavingsAccount(clientId, accountId);
    const client = (await readCollection<ClientDetails>("clients")).find((item) => item.id === clientId);
    if (!client?.verified || !client.activatedAt || client.accessStatus && client.accessStatus !== "active" || account.accountStatus !== "active") throw new AdminError("An active, approved account is required.", 409);
    const totals = savingsTotals(account, await readCollection<FinanceLedgerEntry>("finance-ledger"));
    const amountKobo = Math.min(account.plan.contributionKobo, totals.remainingKobo ?? account.plan.contributionKobo);
    if (!amountKobo) throw new AdminError("This plan's target has already been reached.", 409);
    if (amountKobo < 5000) throw new AdminError("This installment is below Paystack's NGN minimum. Contact the team to review the plan.", 409);
    return updateCollection<SavingsPayment, SavingsPayment>("finance-payments", async (items) => {
      if (items.some((item) => item.accountId === accountId && (item.status === "pending" || item.status === "exception"))) throw new AdminError("Check the existing payment before starting another contribution.", 409);
      const now = new Date().toISOString(); const reference = `DJ-SAVE-${randomUUID()}`;
      const intent: SavingsPayment = { id: randomUUID(), reference, clientId, accountId, amountKobo, currency: "NGN", providerMode: "test", payerEmail: client.email, transactionId: null, checkoutUrl: null, status: "pending", providerStatus: "initializing", receivedKobo: null, exception: "", createdAt: now, updatedAt: now, paidAt: null };
      await appendAudit({ actorId: `client:${clientId}`, action: "savings.payment.initiated", resource: "savings-payment", resourceId: reference, after: { accountId, amountKobo, providerMode: "test" } });
      return { items: [...items, intent], result: intent };
    });
  });
  // Persist before contacting the provider. An ambiguous response remains pending for reconciliation.
  const account = await ownSavingsAccount(clientId, accountId);
  const checkout = await paystack<{ reference: string; authorization_url: string }>("/transaction/initialize", { email: payment.payerEmail, amount: payment.amountKobo, currency: "NGN", reference: payment.reference, callback_url: `${base}/dashboard/client/${servicePaths[account.service]}?reference=${encodeURIComponent(payment.reference)}`, metadata: { accountId, service: account.service } });
  let url: URL; try { url = new URL(checkout.authorization_url); } catch { throw new AdminError("Payment initialization could not be confirmed. Check the existing reference.", 502); }
  if (checkout.reference !== payment.reference || url.protocol !== "https:" || url.hostname !== "checkout.paystack.com" || url.username || url.password) throw new AdminError("Payment initialization could not be confirmed. Check the existing reference.", 502);
  await updateCollection<SavingsPayment, void>("finance-payments", (items) => { const intent = items.find((item) => item.reference === payment.reference)!; intent.checkoutUrl = url.href; if (intent.status === "pending") intent.providerStatus = "pending"; return { items, result: undefined }; });
  return { reference: payment.reference, checkoutUrl: url.href };
}
type VerifiedTransaction = { id: string | number; reference: string; amount: number; currency: string; domain: string; status: string; customer?: { email?: string }; paid_at?: string };
export async function confirmSavingsPayment(reference: string) {
  if (!isSavingsReference(reference)) throw new AdminError("Payment not found.", 404);
  const intent = (await readCollection<SavingsPayment>("finance-payments")).find((item) => item.reference === reference);
  if (!intent) throw new AdminError("Payment not found.", 404);
  requireTestProvider();
  const verified = await paystack<VerifiedTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
  return storageTransaction(async () => {
    const payments = await readCollection<SavingsPayment>("finance-payments"); const payment = payments.find((item) => item.reference === reference)!;
    const priorStatus = payment.status; const ledger = await readCollection<FinanceLedgerEntry>("finance-ledger");
    const receiptId = `${reference}:contribution`; const receipt = ledger.find((entry) => entry.id === receiptId);
    const exact = verified.reference === reference && verified.currency === "NGN" && verified.domain === payment.providerMode && verified.amount === payment.amountKobo && Number.isSafeInteger(verified.amount) && verified.customer?.email?.toLowerCase() === payment.payerEmail.toLowerCase() && verified.id !== undefined && verified.id !== null;
    payment.updatedAt = new Date().toISOString(); payment.providerStatus = String(verified.status || "unknown").slice(0, 60);
    if (!exact) {
      // A malformed response cannot remove a verified receipt, or claim a trusted receipt amount.
      if (!receipt) { payment.status = "exception"; payment.exception = "Provider details do not match the saved contribution. Finance review required."; }
    } else if (verified.status === "success") {
      payment.transactionId = String(verified.id); payment.receivedKobo = verified.amount;
      if (!receipt && payment.status !== "reversed") {
        let eligible = true; let account;
        try { account = await ownSavingsAccount(payment.clientId, payment.accountId); await requireClientService(payment.clientId, account.service); } catch { eligible = false; }
        const client = (await readCollection<ClientDetails>("clients")).find((item) => item.id === payment.clientId);
        const remaining = account ? savingsTotals(account, ledger).remainingKobo : null;
        if (!eligible || !account || account.accountStatus !== "active" || !client?.verified || client.accessStatus && client.accessStatus !== "active" || remaining !== null && remaining < verified.amount || payments.some((item) => item.reference !== reference && item.transactionId === String(verified.id))) {
          payment.status = "exception"; payment.exception = "Confirmed receipt is unallocated. Finance must review the account, reference and remaining target.";
        } else {
          const entry: FinanceLedgerEntry = { id: receiptId, clientId: payment.clientId, accountId: payment.accountId, reference, kind: "contribution", amountKobo: verified.amount, direction: "credit", reversesId: null, createdAt: payment.updatedAt, providerMode: "test" };
          await updateCollection<FinanceLedgerEntry, void>("finance-ledger", (items) => ({ items: [...items, entry], result: undefined }));
          payment.status = "confirmed"; payment.exception = ""; payment.paidAt = typeof verified.paid_at === "string" && Number.isFinite(Date.parse(verified.paid_at)) ? verified.paid_at : payment.updatedAt;
          await appendAudit({ actorId: "system:paystack", action: "savings.ledger.contribution", resource: "savings-payment", resourceId: reference, after: entry });
        }
      }
    } else if (verified.status === "reversed") {
      const alreadyDebited = ledger.filter((entry) => entry.reversesId === receiptId).reduce((sum, entry) => sum + entry.amountKobo, 0);
      if (receipt && alreadyDebited < receipt.amountKobo) {
        const reversal: FinanceLedgerEntry = { ...receipt, id: `${reference}:reversal`, kind: "reversal", amountKobo: receipt.amountKobo - alreadyDebited, direction: "debit", reversesId: receipt.id, createdAt: payment.updatedAt };
        await updateCollection<FinanceLedgerEntry, void>("finance-ledger", (items) => ({ items: [...items, reversal], result: undefined }));
        await appendAudit({ actorId: "system:paystack", action: "savings.ledger.reversal", resource: "savings-payment", resourceId: reference, after: reversal });
      }
      payment.status = "reversed"; payment.transactionId = String(verified.id);
    } else if (!receipt && payment.status !== "reversed") {
      if (verified.status === "failed") payment.status = "failed";
      else if (verified.status === "abandoned") payment.status = "cancelled";
      else if (["pending", "ongoing", "processing", "queued"].includes(verified.status)) { if (!["failed", "cancelled"].includes(payment.status)) payment.status = "pending"; }
      else { payment.status = "exception"; payment.exception = "The provider returned an unsupported state. Finance review is required."; }
    }
    await updateCollection<SavingsPayment, void>("finance-payments", () => ({ items: payments, result: undefined }));
    if (priorStatus !== payment.status) await appendAudit({ actorId: "system:paystack", action: "savings.payment.reconciled", resource: "savings-payment", resourceId: reference, before: { status: priorStatus }, after: { status: payment.status, accountId: payment.accountId } });
    return { reference, status: payment.status };
  });
}
type ProviderRefund = { id: string | number; transaction: string | number | { id: string | number }; currency: string; amount: number; status: string };
/** Observe provider refunds only. Savings refund initiation remains unavailable. */
export async function processSavingsRefunds(reference: string) {
  requireTestProvider();
  let intent = (await readCollection<SavingsPayment>("finance-payments")).find((item) => item.reference === reference);
  if (!intent) throw new AdminError("Payment not found.", 404);
  if (!intent.transactionId) { await confirmSavingsPayment(reference); intent = (await readCollection<SavingsPayment>("finance-payments")).find((item) => item.reference === reference)!; }
  if (!intent.transactionId) return;
  const verified = await paystack<ProviderRefund[]>(`/refund?transaction=${encodeURIComponent(intent.transactionId)}&currency=NGN&perPage=100`);
  if (!Array.isArray(verified) || verified.length >= 100) throw new AdminError("Refund history requires Finance review before it can be reconciled.", 409);
  const refunds = new Map<string, { id: string; amountKobo: number; status: string }>();
  for (const refund of verified) {
    const transaction = refund.transaction && typeof refund.transaction === "object" ? refund.transaction.id : refund.transaction;
    if (!refund.id || String(transaction) !== intent.transactionId || refund.currency !== "NGN" || !Number.isSafeInteger(refund.amount) || refund.amount < 1 || !["pending", "processing", "processed", "failed", "needs-attention"].includes(refund.status)) throw new AdminError("Provider refund details do not match the saved contribution.", 409);
    const normalized = { id: String(refund.id), amountKobo: refund.amount, status: refund.status };
    if (refunds.has(normalized.id) && JSON.stringify(refunds.get(normalized.id)) !== JSON.stringify(normalized)) throw new AdminError("Inconsistent refund history requires Finance review.", 409);
    refunds.set(normalized.id, normalized);
  }
  await storageTransaction(async () => {
    const payment = (await readCollection<SavingsPayment>("finance-payments")).find((item) => item.reference === reference)!;
    const previous = payment.refunds || []; const merged = new Map(previous.map((refund) => [refund.id, refund]));
    for (const refund of refunds.values()) {
      const prior = merged.get(refund.id);
      if (prior && prior.amountKobo !== refund.amountKobo) throw new AdminError("A provider refund amount changed. Finance review is required.", 409);
      merged.set(refund.id, prior?.status === "processed" ? prior : refund);
    }
    const completed = [...merged.values()].filter((refund) => refund.status === "processed");
    const refundedKobo = completed.reduce((sum, refund) => sum + refund.amountKobo, 0);
    if (refundedKobo > (payment.receivedKobo || 0)) throw new AdminError("Provider refunds exceed the verified receipt. Finance review is required.", 409);
    const entries = await readCollection<FinanceLedgerEntry>("finance-ledger"); const receipt = entries.find((entry) => entry.id === `${reference}:contribution`);
    if (receipt) {
      let available = receipt.amountKobo - entries.filter((entry) => entry.reversesId === receipt.id).reduce((sum, entry) => sum + entry.amountKobo, 0);
      for (const refund of completed) {
        const id = `${reference}:refund:${refund.id}`;
        if (entries.some((entry) => entry.id === id)) continue;
        const amountKobo = Math.min(available, refund.amountKobo);
        if (amountKobo > 0) {
          const entry: FinanceLedgerEntry = { ...receipt, id, kind: "refund", direction: "debit", amountKobo, reversesId: receipt.id, createdAt: new Date().toISOString() };
          entries.push(entry); available -= amountKobo;
          await appendAudit({ actorId: "system:paystack", action: "savings.ledger.refund", resource: "savings-payment", resourceId: reference, after: entry });
        }
      }
      await updateCollection<FinanceLedgerEntry, void>("finance-ledger", () => ({ items: entries, result: undefined }));
    }
    payment.refunds = [...merged.values()];
    if (refundedKobo && refundedKobo === payment.receivedKobo) payment.status = "reversed";
    await updateCollection<SavingsPayment, void>("finance-payments", (items) => ({ items: items.map((item) => item.reference === reference ? payment : item), result: undefined }));
    if (JSON.stringify(previous) !== JSON.stringify(payment.refunds)) await appendAudit({ actorId: "system:paystack", action: "savings.refunds.reconciled", resource: "savings-payment", resourceId: reference, after: { refunds: payment.refunds } });
  });
}
export async function reconcileSavingsPayments() {
  // Recheck settled receipts too, so provider reversals append compensating entries.
  const payments = (await readCollection<SavingsPayment>("finance-payments")).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)).slice(0, 3);
  let checked = 0; let errors = 0;
  for (const payment of payments) { try { await confirmSavingsPayment(payment.reference); await processSavingsRefunds(payment.reference); checked++; } catch { errors++; } }
  return { checked, errors };
}
