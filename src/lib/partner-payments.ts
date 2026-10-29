import { randomUUID } from "node:crypto";
import { ContentError } from "@/lib/content-api";
import { appBaseUrl, paystack, serviceConfiguration } from "@/lib/partner-services";
import { audit, buildPartnerQuote, mutateProgramme, paymentReserved, readProgramme, requirePartner, type ProgrammeState } from "@/lib/partner-store";
import type { PartnerPayment, RefundStatus } from "@/lib/partner-types";

type Transaction = { id: string | number; reference: string; status: string; amount: number; currency: string; domain: string; paid_at: string | null; customer: { email: string } };
type Refund = { id: string | number; amount: number; currency: string; status: string; merchant_note?: string };
const refundStatuses: RefundStatus[] = ["pending", "processing", "processed", "failed", "needs-attention"];
function grantTier(state: ProgrammeState, payment: PartnerPayment, paidAt: string) {
  const partner = state.partners.find((item) => item.id === payment.partnerId)!;
  partner.currentTierId = payment.tierId; partner.entitlementPaymentRef = payment.reference;
  partner.registeredAt ||= paidAt; payment.entitledAt = new Date().toISOString();
  audit(state, payment.kind === "upgrade" ? "partner-tier-upgraded" : "partner-registration-completed", payment.reference);
}
export async function createPartnerCheckout(token: string, input: Record<string, unknown>) {
  const payment = await mutateProgramme((state) => {
    const partner = requirePartner(state, token);
    if (state.payments.some((item) => item.partnerId === partner.id && paymentReserved(item))) throw new ContentError("Resume or cancel your current checkout before starting another one.", 409);
    const { quote, promo } = buildPartnerQuote(state, partner, input);
    if (input.fingerprint !== quote.fingerprint) throw new ContentError("The tier or discount has changed. Review an updated quote before paying.", 409);
    if (quote.verificationFeeKobo && input.refundableFeeAccepted !== true) throw new ContentError("Acknowledge the refundable ₦100 verification fee before paying.");
    if (quote.amountKobo > 0 && !serviceConfiguration().payments) throw new ContentError("Payments are not set up yet. Please contact De Jadon Group.", 503);
    if (quote.amountKobo > 0) appBaseUrl();
    const now = new Date().toISOString();
    const expires = Math.min(Date.now() + 30 * 60 * 1000, promo?.endsAt ? Date.parse(promo.endsAt) : Infinity);
    const payment: PartnerPayment = {
      tierSnapshot: structuredClone(state.tiers.find((tier) => tier.id === quote.tierId)!), snapshotOrigin: "checkout",
      ...quote, reference: `DJ-PAY-${randomUUID()}`, partnerId: partner.id, promoId: promo?.id || null,
      providerMode: quote.amountKobo === 0 ? "free" : process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_live_") ? "live" : "test",
      status: quote.amountKobo ? "initializing" : "paid", checkoutUrl: null, expiresAt: new Date(expires).toISOString(), createdAt: now,
      paidAt: quote.amountKobo ? null : now, lastCheckedAt: null, receivedKobo: quote.amountKobo ? null : 0, transactionId: null, entitledAt: null, failureReason: "",
      refundKobo: 0, refundStatus: "none", refundId: null, refundAttemptedAt: null, refundError: ""
    };
    state.payments.push(payment);
    if (!quote.amountKobo) grantTier(state, payment, now);
    audit(state, "partner-checkout-created", payment.reference);
    return payment;
  });
  if (!payment.amountKobo) return payment;
  try {
    const state = await readProgramme(); const partner = state.partners.find((item) => item.id === payment.partnerId)!;
    const initialized = await paystack<{ authorization_url: string; reference: string }>("/transaction/initialize", {
      email: partner.email, amount: payment.amountKobo, currency: "NGN", reference: payment.reference,
      callback_url: `${appBaseUrl()}/partner-programme/payment`, metadata: JSON.stringify({ partnerId: partner.id, tierId: payment.tierId, purpose: payment.kind })
    });
    const checkout = new URL(initialized.authorization_url);
    if (initialized.reference !== payment.reference || checkout.protocol !== "https:" || checkout.hostname !== "checkout.paystack.com" || checkout.username || checkout.password) throw new ContentError("The payment service returned an invalid checkout. Please contact De Jadon Group.", 502);
    return await mutateProgramme((current) => {
      const saved = current.payments.find((item) => item.reference === payment.reference)!;
      if (saved.status === "initializing") { saved.status = "pending"; saved.checkoutUrl = checkout.href; }
      return saved;
    });
  } catch (error) {
    await mutateProgramme((state) => {
      const saved = state.payments.find((item) => item.reference === payment.reference)!;
      if (saved.status === "initializing") { saved.status = "failed"; saved.failureReason = "Checkout could not be opened. No membership has been granted."; }
    });
    throw error;
  }
}
export async function cancelPartnerCheckout(token: string, reference: string) {
  return mutateProgramme((state) => {
    const partner = requirePartner(state, token); const payment = state.payments.find((item) => item.reference === reference && item.partnerId === partner.id);
    if (!payment) throw new ContentError("Payment not found.", 404);
    if (!["initializing", "pending", "failed"].includes(payment.status)) throw new ContentError("This payment cannot be cancelled.");
    payment.status = "cancelled"; payment.checkoutUrl = null; audit(state, "partner-checkout-cancelled", reference);
    return payment;
  });
}
export async function confirmPartnerPayment(reference: string) {
  const before = await readProgramme(); const found = before.payments.find((item) => item.reference === reference);
  if (!found) return null;
  if (found.status === "paid" || found.status === "rejected") { await processPartnerRefund(reference); return (await readProgramme()).payments.find((item) => item.reference === reference)!; }
  await mutateProgramme((state) => { state.payments.find((item) => item.reference === reference)!.lastCheckedAt = new Date().toISOString(); });
  const transaction = await paystack<Transaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
  if (transaction.status !== "success") return found;
  const received = transaction.amount;
  if (transaction.reference !== reference || !Number.isSafeInteger(received) || received <= 0 || transaction.currency !== "NGN" || !transaction.id) throw new ContentError("The payment details could not be verified. Please contact De Jadon Group.", 409);
  await mutateProgramme((state) => {
    const payment = state.payments.find((item) => item.reference === reference)!;
    if (payment.status === "paid" || payment.status === "rejected") return;
    const partner = state.partners.find((item) => item.id === payment.partnerId)!;
    const paidTime = Date.parse(transaction.paid_at || "");
    const promo = payment.promoId ? state.promos.find((item) => item.id === payment.promoId) : null;
    const uses = promo ? state.payments.filter((item) => item.promoId === promo.id && item.entitledAt).length : 0;
    const reason = received !== payment.amountKobo || transaction.customer?.email?.toLowerCase() !== partner.email || transaction.domain !== payment.providerMode ? "The payment did not match the saved checkout." :
      !Number.isFinite(paidTime) || paidTime > Date.parse(payment.expiresAt) || payment.status === "cancelled" ? "Payment arrived after this checkout was cancelled or expired." :
      !partner.emailVerifiedAt || !partner.profileCompletedAt || partner.currentTierId !== payment.fromTierId ? "The account or tier changed before payment confirmation." :
      promo?.maxUses && uses >= promo.maxUses ? "The promo code usage limit was reached before confirmation." : "";
    payment.receivedKobo = received; payment.transactionId = String(transaction.id); payment.paidAt = Number.isFinite(paidTime) ? new Date(paidTime).toISOString() : new Date().toISOString(); payment.checkoutUrl = null;
    if (reason) {
      payment.status = "rejected"; payment.failureReason = `${reason} A full refund has been queued.`; payment.refundKobo = received; payment.refundStatus = "queued";
      audit(state, "partner-payment-rejected-refund-queued", reference);
    } else {
      payment.status = "paid"; grantTier(state, payment, payment.paidAt);
      if (payment.verificationFeeKobo) { payment.refundKobo = payment.verificationFeeKobo; payment.refundStatus = "queued"; }
    }
  });
  // The durable refund job is saved before requesting the immediate refund.
  await processPartnerRefund(reference);
  return (await readProgramme()).payments.find((item) => item.reference === reference)!;
}

async function findExistingRefund(payment: PartnerPayment) {
  return paystack<Refund[]>(`/refund?transaction=${encodeURIComponent(payment.transactionId!)}&currency=NGN&perPage=100`);
}
export async function processPartnerRefund(reference: string, allowRetry = false) {
  const claim = await mutateProgramme((state) => {
    const payment = state.payments.find((item) => item.reference === reference);
    if (!payment || !payment.refundKobo || !payment.transactionId || payment.refundStatus === "processed") return null;
    const providerMode = process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_live_") ? "live" : process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_test_") ? "test" : null;
    if (!providerMode || payment.providerMode !== providerMode) throw new ContentError("This refund requires the original payment environment.", 409);
    if (payment.refundStatus === "submitting" && Date.now() - Date.parse(payment.refundAttemptedAt || "") < 120000) return null;
    const previous = payment.refundStatus;
    payment.refundStatus = "submitting"; payment.refundAttemptedAt = new Date().toISOString();
    return { payment: { ...payment }, previous };
  });
  if (!claim) return;
  let submitted = false;
  try {
    let refund: Refund | undefined;
    if (claim.payment.refundId) refund = await paystack<Refund>(`/refund/${encodeURIComponent(claim.payment.refundId)}`);
    if (!claim.payment.refundId || refund?.status === "failed" && allowRetry) {
      const refunds = await findExistingRefund(claim.payment);
      refund = refunds.find((item) => item.amount === claim.payment.refundKobo && item.currency === "NGN" && item.status !== "failed");
      const existingKobo = refunds.filter((item) => item.currency === "NGN" && item.status !== "failed" && Number.isSafeInteger(item.amount) && item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
      if (!refund && existingKobo + claim.payment.refundKobo > (claim.payment.receivedKobo ?? 0)) throw new ContentError("Existing provider refunds leave insufficient refundable funds.", 409);
      if (!refund && (claim.previous === "queued" || allowRetry && ["failed", "uncertain"].includes(claim.previous))) {
        submitted = true;
        refund = await paystack<Refund>("/refund", { transaction: claim.payment.transactionId, amount: claim.payment.refundKobo, currency: "NGN", customer_note: "Immediate refund of your De Jadon Group verification payment.", merchant_note: `De Jadon Group refund ${reference}` });
      }
    }
    await mutateProgramme((state) => {
      const payment = state.payments.find((item) => item.reference === reference)!;
      if (!refund || !refund.id || refund.amount !== payment.refundKobo || refund.currency !== "NGN" || !refundStatuses.includes(refund.status as RefundStatus)) {
        payment.refundStatus = "uncertain"; payment.refundError = "The refund needs reconciliation. Please contact De Jadon Group.";
      } else {
        payment.refundId = String(refund.id); payment.refundStatus = refund.status as RefundStatus;
        payment.refundError = refund.status === "needs-attention" ? "Paystack needs bank details to finish this refund. Please contact De Jadon Group." : refund.status === "failed" ? "The refund failed. De Jadon Group needs to retry it." : "";
      }
      audit(state, `partner-refund-${payment.refundStatus}`, reference);
    });
  } catch {
    await mutateProgramme((state) => {
      const payment = state.payments.find((item) => item.reference === reference)!;
      payment.refundStatus = !submitted && claim.previous === "queued" ? "queued" : "uncertain"; payment.refundError = "The refund request could not be confirmed. It will be reconciled before any retry.";
      audit(state, "partner-refund-needs-reconciliation", reference);
    });
  }
}
export async function verifyOwnPartnerPayment(token: string, reference: string) {
  const state = await readProgramme(); const partner = requirePartner(state, token);
  if (!state.payments.some((item) => item.reference === reference && item.partnerId === partner.id)) throw new ContentError("Payment not found.", 404);
  return confirmPartnerPayment(reference);
}
export async function reconcilePartnerPayments() {
  const state = await readProgramme();
  const refunds = state.payments.filter((item) => item.refundKobo && !["none", "processed", "needs-attention", "failed"].includes(item.refundStatus)).sort((a, b) => (a.refundAttemptedAt || "").localeCompare(b.refundAttemptedAt || ""));
  const pending = state.payments.filter((item) => ["initializing", "pending"].includes(item.status)).sort((a, b) => (a.lastCheckedAt || "").localeCompare(b.lastCheckedAt || ""));
  const results = await Promise.allSettled([...refunds.slice(0, 3).map((item) => processPartnerRefund(item.reference)), ...pending.slice(0, 3).map((item) => confirmPartnerPayment(item.reference))]);
  return { checked: results.length, failed: results.filter((item) => item.status === "rejected").length };
}
