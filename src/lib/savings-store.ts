import { createHash, randomUUID } from "node:crypto";
import { readCollection, updateCollection, storageTransaction } from "@/lib/site-storage";
import { appendAudit } from "@/lib/admin-audit";
import { AdminError } from "@/lib/admin-store";
import { can, inScope, type AdminPrincipal, type Permission } from "@/lib/admin-permissions";
import { requireClientService, recordEvent } from "@/lib/client-services";
import { kobo } from "@/lib/finance-store";
import { getPublishedProducts } from "@/lib/marketplace-store";
import type { ClientDetails } from "@/lib/client-types";
import type { FinanceLedgerEntry, FoodSavingsOffer, PackageSnapshot, SavingsAccount, SavingsPayment, SavingsPlanConfig, SavingsService } from "@/lib/savings-types";

type Configuration = { plans: SavingsPlanConfig[]; offers: FoodSavingsOffer[] };
export const savingsAccounts = () => readCollection<SavingsAccount>("savings-accounts");
export async function savingsConfiguration(): Promise<Configuration> { return (await readCollection<Configuration>("savings-config"))[0] || { plans: [], offers: [] }; }
export function savingsAdmin(admin: AdminPrincipal, permission: Permission, clientId?: string) {
  if (!can(admin, permission)) throw new AdminError("You do not have permission for this savings action.", 403);
  if (clientId && !inScope(admin, "clients", clientId)) throw new AdminError("Client not found.", 404);
}
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
function text(value: unknown, label: string, max = 4000) { if (typeof value !== "string" || !value.trim() || value.length > max) throw new AdminError(`Enter ${label} (up to ${max} characters).`); return value.trim(); }
function integer(value: unknown, min: number, max: number, label: string) { const n = Number(value); if (value === null || value === undefined || value === "" || !Number.isSafeInteger(n) || n < min || n > max) throw new AdminError(`Check ${label}.`); return n; }
function boolean(value: unknown, label: string) { if (typeof value !== "boolean") throw new AdminError(`Configure ${label} explicitly.`); return value; }
function positiveMoney(value: unknown) { const amount = kobo(value); if (amount < 1) throw new AdminError("Amounts must be greater than zero."); return amount; }
function publication(value: unknown) { if (value !== "draft" && value !== "published" && value !== "withdrawn") throw new AdminError("Choose draft, published or withdrawn."); return value; }
export async function saveSavingsPlan(admin: AdminPrincipal, input: Record<string, unknown>) {
  savingsAdmin(admin, "savings.plans.manage");
  return updateCollection<Configuration, SavingsPlanConfig>("savings-config", async (items) => {
    const config = items[0] || { plans: [], offers: [] }; const before = config.plans.find((plan) => plan.id === input.id);
    if (input.id && !before) throw new AdminError("Plan not found.", 404);
    if (input.service !== "flexisave" && input.service !== "food_package_savings") throw new AdminError("Choose a savings service.");
    if (before && before.service !== input.service) throw new AdminError("A plan's service cannot change.", 409);
    if (!["daily", "weekly", "monthly"].includes(String(input.frequency))) throw new AdminError("Choose a contribution frequency.");
    const now = new Date().toISOString();
    const plan: SavingsPlanConfig = {
      id: before?.id || randomUUID(), name: text(input.name, "a plan name", 120), service: input.service, status: publication(input.status), version: (before?.version || 0) + 1,
      contributionKobo: positiveMoney(input.contribution), frequency: input.frequency as SavingsPlanConfig["frequency"], interval: integer(input.interval, 1, 365, "the schedule interval"), graceDays: integer(input.graceDays, 0, 365, "the grace period"),
      targetKobo: input.target === "" || input.target === null || input.target === undefined ? null : positiveMoney(input.target),
      terms: text(input.terms, "the approved plan terms"), consentText: text(input.consentText, "the agreement text", 2000), requirePhone: boolean(input.requirePhone, "whether a phone number is required"),
      withdrawalsAllowed: boolean(input.withdrawalsAllowed, "withdrawal availability"), withdrawalHoldDays: integer(input.withdrawalHoldDays, 0, 36500, "the withdrawal holding period"), minimumBalanceKobo: kobo(input.minimumBalance), withdrawalRequiresTarget: boolean(input.withdrawalRequiresTarget, "whether the target is required for withdrawal"),
      createdAt: before?.createdAt || now, updatedAt: now, updatedBy: admin.id
    };
    if (plan.service === "food_package_savings" && plan.targetKobo !== null) throw new AdminError("Food savings targets belong to the offer. Leave this plan's target blank.");
    if (plan.service === "flexisave" && plan.withdrawalRequiresTarget && !plan.targetKobo) throw new AdminError("A target is required by these withdrawal rules.");
    if (before) config.plans = config.plans.map((item) => item.id === plan.id ? plan : item); else config.plans.push(plan);
    await appendAudit({ actorId: admin.id, action: "savings.plan.configured", resource: "savings-plan", resourceId: plan.id, before, after: plan });
    return { items: [config], result: plan };
  });
}
export async function saveFoodOffer(admin: AdminPrincipal, input: Record<string, unknown>) {
  savingsAdmin(admin, "savings.offers.manage");
  return updateCollection<Configuration, FoodSavingsOffer>("savings-config", async (items) => {
    const config = items[0] || { plans: [], offers: [] }; const before = config.offers.find((offer) => offer.id === input.id);
    if (input.id && !before) throw new AdminError("Offer not found.", 404);
    const status = publication(input.status);
    if (status === "published" || before?.status === "published") savingsAdmin(admin, "savings.offers.publish");
    const product = (await getPublishedProducts()).find((item) => item.slug === input.productSlug && item.category === "food-packages" && item.availability !== "out-of-stock");
    if (!product) throw new AdminError("Choose an available published food-package product.");
    if (!Array.isArray(input.planIds) || !input.planIds.length || input.planIds.length > 20 || new Set(input.planIds).size !== input.planIds.length) throw new AdminError("Choose one or more distinct contribution plans.");
    const planIds = input.planIds.map(String);
    if (planIds.some((id) => !config.plans.some((plan) => plan.id === id && plan.service === "food_package_savings" && plan.status === "published"))) throw new AdminError("Offer plans must be published food-package contribution plans.");
    if (!Array.isArray(input.fulfillmentStages) || input.fulfillmentStages.length > 10) throw new AdminError("Configure up to ten approved fulfillment stages, or leave them empty.");
    const stages = input.fulfillmentStages.map((raw: unknown) => {
      if (!raw || typeof raw !== "object") throw new AdminError("Check the fulfillment stages."); const stage = raw as Record<string, unknown>;
      const id = text(stage.id, "a stable stage identifier", 60); if (!/^[a-z][a-z0-9_-]*$/.test(id)) throw new AdminError("Stage identifiers must start with a letter and use lowercase letters, digits, hyphens or underscores.");
      return { id, label: text(stage.label, "a fulfillment stage label", 120), final: boolean(stage.final, "whether the stage completes fulfillment") };
    });
    if (new Set(stages.map((stage) => stage.id)).size !== stages.length || stages.some((stage, index) => stage.final && index !== stages.length - 1)) throw new AdminError("Use unique ordered stages; only the last stage can complete fulfillment.");
    const now = new Date().toISOString();
    const offer: FoodSavingsOffer = { id: before?.id || randomUUID(), productSlug: product.slug, contents: text(input.contents, "the actual package contents"), targetKobo: positiveMoney(input.target), planIds, fulfillmentTerms: text(input.fulfillmentTerms, "the approved fulfillment terms"), fulfillmentStages: stages, status, version: (before?.version || 0) + 1, createdAt: before?.createdAt || now, updatedAt: now, updatedBy: admin.id };
    if (before) config.offers = config.offers.map((item) => item.id === offer.id ? offer : item); else config.offers.push(offer);
    await appendAudit({ actorId: admin.id, action: "savings.offer.configured", resource: "food-savings-offer", resourceId: offer.id, before, after: offer });
    return { items: [config], result: offer };
  });
}
export async function availableSavingsOptions(service: SavingsService) {
  const config = await savingsConfiguration();
  if (service === "flexisave") return { plans: config.plans.filter((plan) => plan.service === service && plan.status === "published").map((plan) => ({ plan, fingerprint: digest(plan) })), offers: [] };
  const products = await getPublishedProducts();
  const offers = config.offers.flatMap((offer) => {
    const product = products.find((item) => item.slug === offer.productSlug && item.category === "food-packages" && item.availability !== "out-of-stock");
    const plans = config.plans.filter((plan) => plan.service === service && plan.status === "published" && offer.planIds.includes(plan.id));
    return offer.status === "published" && product && plans.length && offer.targetKobo > 0 ? [{ offer, product, plans, fingerprint: digest({ offer, product, plans }) }] : [];
  });
  return { plans: [], offers };
}
export async function ownSavingsAccount(clientId: string, id: string, requireAccess = true) {
  const account = (await savingsAccounts()).find((item) => item.id === id && item.clientId === clientId);
  if (!account) throw new AdminError("Savings record not found.", 404);
  if (requireAccess) await requireClientService(clientId, account.service);
  return account;
}
async function enrolledClient(clientId: string) {
  const client = (await readCollection<ClientDetails>("clients")).find((item) => item.id === clientId);
  if (!client || !client.verified || client.accessStatus && client.accessStatus !== "active") throw new AdminError("A verified, active client record is required.", 409);
  return client;
}
export async function requestSavingsEnrollment(clientId: string, service: SavingsService, input: Record<string, unknown>, representative?: AdminPrincipal) {
  return storageTransaction(async () => {
    if (representative) savingsAdmin(representative, "savings.enrollments.manage", clientId);
    const assignment = await requireClientService(clientId, service); const client = await enrolledClient(clientId);
    const accounts = await savingsAccounts();
    if (accounts.some((item) => item.clientId === clientId && item.service === service && item.accountStatus !== "completed" && !["rejected", "cancelled"].includes(item.enrollmentStatus))) throw new AdminError("This service already has an open enrollment or plan. Review that record first.", 409);
    const options = await availableSavingsOptions(service); let plan: SavingsPlanConfig | undefined; let snapshot: PackageSnapshot | null = null; let expected = "";
    if (service === "flexisave") { const option = options.plans.find((item) => item.plan.id === input.planId); plan = option?.plan; expected = option?.fingerprint || ""; }
    else {
      const option = options.offers.find((item) => item.offer.id === input.offerId); plan = option?.plans.find((item) => item.id === input.planId); expected = option?.fingerprint || "";
      if (option) snapshot = { offerId: option.offer.id, offerVersion: option.offer.version, productSlug: option.product.slug, name: option.product.name, description: option.product.description || option.product.summary, image: option.product.image || null, imageAlt: option.product.imageAlt || option.product.name, contents: option.offer.contents, targetKobo: option.offer.targetKobo, fulfillmentTerms: option.offer.fulfillmentTerms, fulfillmentStages: structuredClone(option.offer.fulfillmentStages) };
    }
    if (!plan || !expected) throw new AdminError("This savings option is unavailable.", 409);
    if (input.fingerprint !== expected) throw new AdminError("The offer or terms changed. Refresh and review the current details.", 409);
    if (!representative && input.agree !== true) throw new AdminError("Review and accept the displayed agreement first.");
    if (!representative && plan.requirePhone && !client.phone) throw new AdminError("Add the required phone number in your profile before submitting.");
    const actor = representative?.id || `client:${clientId}`; const event = recordEvent(actor, representative ? "started" : "submitted", representative ? "In-person enrollment started; client consent is pending." : "Client accepted the displayed agreement.");
    const account: SavingsAccount = { id: randomUUID(), clientId, assignmentId: assignment.id, service, representativeId: representative?.id || null, enrollmentStatus: representative ? "started" : "submitted", accountStatus: "not_active", plan: structuredClone(plan), package: snapshot, consent: representative ? null : { at: event.at, clientId, text: plan.consentText }, startDate: null, approvedAt: null, activatedAt: null, fulfillment: { stageId: null, complete: false, updates: [] }, createdAt: event.at, updatedAt: event.at, history: [event] };
    await updateCollection<SavingsAccount, void>("savings-accounts", (items) => ({ items: [...items, account], result: undefined }));
    await appendAudit({ actorId: actor, action: "savings.enrollment.started", resource: "savings-account", resourceId: account.id, after: { clientId, service, planId: plan.id, planVersion: plan.version, offerId: snapshot?.offerId, representativeId: account.representativeId, enrollmentStatus: account.enrollmentStatus } });
    return account;
  });
}
export async function consentToSavings(clientId: string, accountId: string, input: Record<string, unknown>) {
  return storageTransaction(async () => {
    const current = await ownSavingsAccount(clientId, accountId); const client = await enrolledClient(clientId);
    if (!["started", "information_pending"].includes(current.enrollmentStatus) || input.agree !== true) throw new AdminError("This record cannot be submitted without its required agreement.", 409);
    if (current.plan.requirePhone && !client.phone) throw new AdminError("Add your phone number in your profile first.");
    return updateCollection<SavingsAccount, SavingsAccount>("savings-accounts", async (items) => {
      const account = items.find((item) => item.id === accountId)!; const event = recordEvent(`client:${clientId}`, "submitted", "Client accepted the recorded agreement.");
      account.consent = { clientId, at: event.at, text: account.plan.consentText }; account.enrollmentStatus = "submitted"; account.updatedAt = event.at; account.history.push(event);
      await appendAudit({ actorId: event.actorId, action: "savings.enrollment.consented", resource: "savings-account", resourceId: accountId });
      return { items, result: account };
    });
  });
}
export async function changeSavingsEnrollment(admin: AdminPrincipal, input: Record<string, unknown>) {
  return storageTransaction(async () => {
    const account = (await savingsAccounts()).find((item) => item.id === input.accountId);
    if (!account) throw new AdminError("Savings record not found.", 404);
    const action = input.action; const permission: Permission = action === "activate" || action === "suspend" || action === "resume" ? "savings.accounts.activate" : action === "pending" ? "savings.enrollments.manage" : "savings.enrollments.review";
    savingsAdmin(admin, permission, account.clientId); const reason = text(input.reason, "a review reason", 1000); const before = structuredClone(account);
    if (action === "pending") { if (account.enrollmentStatus !== "started") throw new AdminError("Only a started enrollment can be marked information pending.", 409); account.enrollmentStatus = "information_pending"; }
    else if (action === "review") { if (account.enrollmentStatus !== "submitted" || !account.consent) throw new AdminError("Client submission and consent are required.", 409); account.enrollmentStatus = "reviewed"; }
    else if (action === "approve") { if (account.enrollmentStatus !== "reviewed" || !account.consent) throw new AdminError("Review the submitted enrollment first.", 409); account.enrollmentStatus = "approved"; account.approvedAt = new Date().toISOString(); }
    else if (action === "reject") { if (!["submitted", "reviewed"].includes(account.enrollmentStatus)) throw new AdminError("Only submitted or reviewed enrollments can be rejected.", 409); account.enrollmentStatus = "rejected"; }
    else if (action === "activate") {
      if (account.enrollmentStatus !== "approved" || account.accountStatus !== "not_active" || !account.consent) throw new AdminError("An approved enrollment with consent is required.", 409);
      await requireClientService(account.clientId, account.service); const client = await enrolledClient(account.clientId);
      if (!client.activatedAt || account.plan.requirePhone && !client.phone) throw new AdminError("The client must activate their account and provide the required information first.", 409);
      account.accountStatus = "active"; account.activatedAt = new Date().toISOString(); account.startDate = account.activatedAt.slice(0, 10);
    } else if (action === "suspend") { if (account.accountStatus !== "active") throw new AdminError("Only an active savings account can be suspended.", 409); account.accountStatus = "suspended"; }
    else if (action === "resume") { if (account.accountStatus !== "suspended") throw new AdminError("Only suspended savings accounts can resume.", 409); await requireClientService(account.clientId, account.service); await enrolledClient(account.clientId); account.accountStatus = "active"; }
    else throw new AdminError("Choose a supported enrollment action.");
    const event = recordEvent(admin.id, String(action), reason); account.history.push(event); account.updatedAt = event.at;
    await updateCollection<SavingsAccount, void>("savings-accounts", (items) => ({ items: items.map((item) => item.id === account.id ? account : item), result: undefined }));
    await appendAudit({ actorId: admin.id, action: `savings.enrollment.${action}`, resource: "savings-account", resourceId: account.id, before: { enrollmentStatus: before.enrollmentStatus, accountStatus: before.accountStatus }, after: { enrollmentStatus: account.enrollmentStatus, accountStatus: account.accountStatus }, reason });
    return account;
  });
}
export function accountTarget(account: SavingsAccount) { return account.package?.targetKobo ?? account.plan.targetKobo; }
export function savingsTotals(account: SavingsAccount, ledger: FinanceLedgerEntry[]) {
  const entries = ledger.filter((entry) => entry.accountId === account.id && entry.clientId === account.clientId);
  const confirmedKobo = entries.reduce((sum, entry) => sum + (entry.direction === "credit" ? entry.amountKobo : -entry.amountKobo), 0);
  if (!Number.isSafeInteger(confirmedKobo) || confirmedKobo < 0) throw new AdminError("The savings ledger requires Finance review.", 409);
  const targetKobo = accountTarget(account); const validTarget = Number.isSafeInteger(targetKobo) && targetKobo! > 0 ? targetKobo : null;
  return { balanceKobo: confirmedKobo, confirmedKobo, targetKobo: validTarget, remainingKobo: validTarget === null ? null : Math.max(0, validTarget - confirmedKobo), percent: validTarget === null ? null : Math.min(100, Number(BigInt(confirmedKobo) * BigInt(100) / BigInt(validTarget))) };
}
/** Calendar schedule, anchored to activation day; no invented maturity, interest or penalty. */
export function scheduledDate(account: SavingsAccount, index: number) {
  if (!account.startDate) return null;
  const [year, month, day] = account.startDate.split("-").map(Number); const date = new Date(Date.UTC(year, month - 1, day)); const steps = index * account.plan.interval;
  if (account.plan.frequency === "monthly") { date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + steps); date.setUTCDate(Math.min(day, new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate())); }
  else date.setUTCDate(date.getUTCDate() + steps * (account.plan.frequency === "weekly" ? 7 : 1));
  return date.toISOString().slice(0, 10);
}
export function contributionSchedule(account: SavingsAccount, ledger: FinanceLedgerEntry[], now = new Date()) {
  const totals = savingsTotals(account, ledger);
  if (!account.startDate || account.accountStatus === "completed" || totals.remainingKobo === 0) return { nextDue: null, overdueCount: 0, due: false };
  const covered = Math.floor(totals.confirmedKobo / account.plan.contributionKobo); const nextDue = scheduledDate(account, covered)!; const today = now.toISOString().slice(0, 10);
  let overdueCount = 0;
  // Bounded by the supported Gregorian schedule and elapsed days (not ledger events).
  for (let index = covered; index < covered + 36600; index++) {
    if (totals.targetKobo !== null && index * account.plan.contributionKobo >= totals.targetKobo) break;
    const date = new Date(`${scheduledDate(account, index)}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + account.plan.graceDays);
    if (date.toISOString().slice(0, 10) >= today) break; overdueCount++;
  }
  return { nextDue, overdueCount, due: nextDue <= today };
}
export async function updateSavingsFulfillment(admin: AdminPrincipal, input: Record<string, unknown>) {
  return storageTransaction(async () => {
    const account = (await savingsAccounts()).find((item) => item.id === input.accountId); if (!account?.package) throw new AdminError("Package plan not found.", 404);
    savingsAdmin(admin, "savings.fulfillment.manage", account.clientId); await requireClientService(account.clientId, account.service);
    if (account.accountStatus !== "active" || savingsTotals(account, await readCollection<FinanceLedgerEntry>("finance-ledger")).remainingKobo !== 0) throw new AdminError("An active, fully funded plan is required before fulfillment updates.", 409);
    const { financeOperations } = await import("@/lib/finance-store");
    if ((await financeOperations()).some((item) => item.kind === "savings-withdrawal" && item.withdrawalId === account.id && ["requested", "review", "approved", "executing"].includes(item.state))) throw new AdminError("Resolve outstanding withdrawal requests before recording package fulfillment.", 409);
    const stages = account.package.fulfillmentStages; const current = stages.findIndex((stage) => stage.id === account.fulfillment.stageId); const next = stages[current + 1];
    if (!next || next.id !== input.stageId) throw new AdminError("Follow the agreed configured fulfillment stages in order.", 409);
    const reason = text(input.reason, "the actual fulfillment update", 1000); const event = recordEvent(admin.id, next.id, reason);
    account.fulfillment.stageId = next.id; account.fulfillment.complete = next.final; account.fulfillment.updates.push(event); account.updatedAt = event.at;
    if (next.final) account.accountStatus = "completed";
    await updateCollection<SavingsAccount, void>("savings-accounts", (items) => ({ items: items.map((item) => item.id === account.id ? account : item), result: undefined }));
    await appendAudit({ actorId: admin.id, action: "savings.fulfillment.updated", resource: "savings-account", resourceId: account.id, after: { stageId: next.id, complete: next.final }, reason });
    return account;
  });
}
export function publicSavingsAccount(account: SavingsAccount) {
  // Staff reasons and actor identifiers stay in the administrative workspace.
  const { representativeId: _rep, history: _history, ...safe } = account;
  const { updatedBy: _actor, ...plan } = safe.plan;
  return { ...safe, plan, fulfillment: { ...safe.fulfillment, updates: safe.fulfillment.updates.map(({ at, action, reason }) => ({ at, action, reason })) } };
}
export async function clientSavingsView(clientId: string, service: SavingsService) {
  return storageTransaction(async () => {
    await requireClientService(clientId, service);
    const ledger = await readCollection<FinanceLedgerEntry>("finance-ledger"); const payments = await readCollection<SavingsPayment>("finance-payments");
    const { financeOperations: operations, savingsWithdrawalEligibility } = await import("@/lib/finance-store");
    const withdrawals = (await operations()).filter((item) => item.kind === "savings-withdrawal" && item.clientId === clientId);
    const accounts = await Promise.all((await savingsAccounts()).filter((item) => item.clientId === clientId && item.service === service).map(async (account) => ({ account: publicSavingsAccount(account), withdrawalEligibility: await savingsWithdrawalEligibility(account), totals: savingsTotals(account, ledger), schedule: contributionSchedule(account, ledger), payments: payments.filter((item) => item.accountId === account.id && item.clientId === clientId).map(({ reference, amountKobo, status, exception, createdAt, paidAt, providerMode, refunds }) => ({ reference, amountKobo, status, exception, createdAt, paidAt, providerMode, refunds: refunds?.map(({ amountKobo, status }) => ({ amountKobo, status })) || [] })), withdrawals: withdrawals.filter((item) => item.withdrawalId === account.id).map(({ id, state, amountKobo, reference, createdAt, updatedAt }) => ({ id, state, amountKobo, reference, createdAt, updatedAt })) })));
    const options = await availableSavingsOptions(service);
    const safePlan = ({ updatedBy: _actor, ...plan }: SavingsPlanConfig) => plan;
    const safeOptions = { plans: options.plans.map((item) => ({ ...item, plan: safePlan(item.plan) })), offers: options.offers.map((item) => { const { updatedBy: _actor, ...offer } = item.offer; return { ...item, offer, plans: item.plans.map(safePlan) }; }) };
    return { service, accounts, options: safeOptions, testPaymentsAvailable: process.env.SAVINGS_PAYMENTS_MODE === "test" && Boolean(process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_test_") && process.env.APP_BASE_URL), livePaymentsAvailable: false, withdrawalsExecutionAvailable: false };
  });
}
export type ClientSavingsView = Awaited<ReturnType<typeof clientSavingsView>>;
