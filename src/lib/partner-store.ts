import { createHash, randomBytes, randomInt, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { ContentError } from "@/lib/content-api";
import { readCollection, updateCollection } from "@/lib/site-storage";
import { otpDigest, sendPartnerOtp, serviceConfiguration } from "@/lib/partner-services";
import { emailField, integerField, isoField, moneyField, passwordField, textField } from "@/lib/partner-validation";
import type { PartnerAccount, PartnerPayment, PartnerProfile, PartnerPromo, PartnerQuote, PartnerTier, PartnerView, TierPreview } from "@/lib/partner-types";

export type PartnerRecord = PartnerAccount & {
  aliases: string[]; referrerId: string | null; entitlementPaymentRef: string | null;
  passwordSalt: string; passwordHash: string; sessions: { hash: string; expiresAt: number }[];
  otpHash: string | null; otpExpiresAt: number; otpAttempts: number; otpSentAt: number;
};
export type ProgrammeState = {
  tiers: PartnerTier[]; promos: PartnerPromo[]; partners: PartnerRecord[]; payments: PartnerPayment[];
  audit: { at: string; action: string; subject: string }[];
};
const emptyState = (): ProgrammeState => ({ tiers: [], promos: [], partners: [], payments: [], audit: [] });
export const readProgramme = async () => (await readCollection<ProgrammeState>("partner-programme"))[0] || emptyState();
export function mutateProgramme<T>(update: (state: ProgrammeState) => T | Promise<T>) {
  return updateCollection<ProgrammeState, T>("partner-programme", async (items) => {
    const state = items[0] || emptyState();
    const result = await update(state);
    return { items: [state], result };
  });
}
export function audit(state: ProgrammeState, action: string, subject: string) {
  state.audit.push({ at: new Date().toISOString(), action, subject });
  state.audit = state.audit.slice(-2000);
}
export const partnerSessionSeconds = 8 * 60 * 60;
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
function session() {
  const token = randomBytes(32).toString("base64url");
  return { token, stored: { hash: digest(token), expiresAt: Date.now() + partnerSessionSeconds * 1000 } };
}
function derive(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, { N: 65536, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key.toString("hex"))));
}
async function passwordMatches(record: PartnerRecord, password: unknown) {
  if (typeof password !== "string" || password.length > 128) return false;
  return timingSafeEqual(Buffer.from(await derive(password, record.passwordSalt), "hex"), Buffer.from(record.passwordHash, "hex"));
}
export function findPartner(state: ProgrammeState, token: string | undefined) {
  if (!token || token.length > 100) return undefined;
  const hash = digest(token);
  return state.partners.find((partner) => partner.sessions.some((item) => item.hash === hash && item.expiresAt > Date.now()));
}
export function requirePartner(state: ProgrammeState, token: string) {
  const partner = findPartner(state, token);
  if (!partner) throw new ContentError("Sign in to your partner account.", 401);
  return partner;
}
export function accountDetails(record: PartnerRecord): PartnerAccount {
  return {
    id: record.id, fullName: record.fullName, email: record.email, username: record.username, photoDataUrl: record.photoDataUrl,
    phone: record.phone, accountNumber: record.accountNumber, location: record.location, dob: record.dob, occupation: record.occupation, nationality: record.nationality,
    emailVerifiedAt: record.emailVerifiedAt, profileCompletedAt: record.profileCompletedAt, registeredAt: record.registeredAt, currentTierId: record.currentTierId, createdAt: record.createdAt
  };
}
export function activePartner(state: ProgrammeState, record: PartnerRecord) {
  const mode = process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_live_") ? "live" : process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_test_") ? "test" : null;
  return Boolean(record.emailVerifiedAt && record.profileCompletedAt && record.registeredAt && record.currentTierId && state.tiers.some((tier) => tier.id === record.currentTierId) && state.payments.some((payment) => payment.reference === record.entitlementPaymentRef && payment.partnerId === record.id && payment.tierId === record.currentTierId && payment.status === "paid" && payment.entitledAt && (!mode || payment.providerMode === "free" || payment.providerMode === mode)));
}
export function tierPreview(tier: PartnerTier): TierPreview {
  return { ...tier, benefits: tier.benefits.map(({ id, title, summary }) => ({ id, title, summary })) };
}
export const getPublicPartnerTiers = async () => (await readProgramme()).tiers.filter((tier) => tier.active).sort((a, b) => a.rank - b.rank).map(tierPreview);
export const getPartnerAccountCount = async () => (await readProgramme()).partners.length;
export async function getPartnerView(token: string | undefined): Promise<PartnerView | null> {
  const state = await readProgramme(); const partner = findPartner(state, token);
  if (!partner) return null;
  const active = activePartner(state, partner);
  const network = state.partners.filter((item) => item.referrerId === partner.id);
  return {
    partner: accountDetails(partner), active,
    currentTier: active ? state.tiers.find((tier) => tier.id === partner.currentTierId)! : null,
    tiers: state.tiers.filter((tier) => tier.active).sort((a, b) => a.rank - b.rank).map(tierPreview),
    payments: state.payments.filter((payment) => payment.partnerId === partner.id).slice().reverse(),
    network: { introduced: network.length, verified: network.filter((item) => item.emailVerifiedAt).length, registered: network.filter((item) => activePartner(state, item)).length }
  };
}
export async function getPartnerBenefit(token: string, id: string) {
  const view = await getPartnerView(token);
  if (!view) throw new ContentError("Sign in to your partner account.", 401);
  if (!view.active) throw new ContentError("Complete registration and payment before accessing benefits.", 403);
  const benefit = view.currentTier?.benefits.find((item) => item.id === id);
  if (!benefit) throw new ContentError("This benefit is not included in your current tier.", 403);
  return benefit;
}

export async function registerPartner(input: Record<string, unknown>) {
  if (!serviceConfiguration().email) throw new ContentError("Verification email is not set up yet. Please contact De Jadon Group.", 503);
  const email = emailField(input.email); const fullName = textField(input.fullName, "full name", 120, true);
  if (fullName.length < 2) throw new ContentError("Enter your full name.");
  const password = passwordField(input.password); const salt = randomBytes(16).toString("hex");
  const passwordHash = await derive(password, salt); const otp = String(randomInt(100000, 1000000)); const deliveryId = randomUUID();
  const result = await mutateProgramme((state) => {
    if (state.partners.some((item) => item.email === email)) throw new ContentError("An account already uses this email. Sign in to continue or resend verification.", 409);
    const now = new Date().toISOString(); const current = session();
    const id = `DJ-P-${randomBytes(8).toString("hex").toUpperCase()}`;
    let username = `partner_${randomBytes(5).toString("hex")}`;
    while (state.partners.some((item) => item.aliases.includes(username))) username = `partner_${randomBytes(5).toString("hex")}`;
    const ref = textField(input.ref, "referral", 40).toLowerCase();
    const referrer = ref ? state.partners.find((item) => item.aliases.includes(ref) && activePartner(state, item)) : null;
    const partner: PartnerRecord = {
      id, fullName, email, username, aliases: [username, id.toLowerCase()], photoDataUrl: "", referrerId: referrer?.id || null,
      phone: "", accountNumber: "", location: "", dob: "", occupation: "", nationality: "",
      emailVerifiedAt: null, profileCompletedAt: null, registeredAt: null, currentTierId: null, entitlementPaymentRef: null,
      createdAt: now, passwordSalt: salt, passwordHash, sessions: [current.stored],
      otpHash: otpDigest(id, otp), otpExpiresAt: Date.now() + 10 * 60 * 1000, otpAttempts: 0, otpSentAt: Date.now()
    };
    state.partners.push(partner); audit(state, "partner-account-created", id);
    return { token: current.token, partner: accountDetails(partner) };
  });
  let verificationSent = true;
  try { await sendPartnerOtp(email, otp, deliveryId); } catch { verificationSent = false; }
  return { ...result, verificationSent };
}
export async function signInPartner(input: Record<string, unknown>) {
  const email = emailField(input.email);
  const found = (await readProgramme()).partners.find((item) => item.email === email);
  const matches = found ? await passwordMatches(found, input.password) : (await derive(typeof input.password === "string" ? input.password.slice(0, 128) : "", "dejadon-partner-signin"), false);
  if (!found || !matches) throw new ContentError("The email or password is incorrect.", 401);
  return mutateProgramme((state) => {
    const partner = state.partners.find((item) => item.id === found.id);
    if (!partner || partner.passwordHash !== found.passwordHash) throw new ContentError("Sign in again with your current password.", 401);
    const current = session(); partner.sessions = [...partner.sessions.filter((item) => item.expiresAt > Date.now()).slice(-4), current.stored];
    return { token: current.token, partner: accountDetails(partner) };
  });
}
export async function resendPartnerOtp(token: string) {
  const otp = String(randomInt(100000, 1000000));
  const result = await mutateProgramme((state) => {
    const partner = requirePartner(state, token);
    if (partner.emailVerifiedAt) throw new ContentError("Your email is already verified.");
    if (Date.now() - partner.otpSentAt < 60000) throw new ContentError("Please wait 60 seconds before requesting another code.", 429);
    partner.otpHash = otpDigest(partner.id, otp); partner.otpExpiresAt = Date.now() + 10 * 60 * 1000; partner.otpAttempts = 0; partner.otpSentAt = Date.now();
    return { email: partner.email, deliveryId: randomUUID() };
  });
  await sendPartnerOtp(result.email, otp, result.deliveryId);
}
export async function verifyPartnerOtp(token: string, input: Record<string, unknown>) {
  const code = textField(input.code, "six-digit verification code", 6, true);
  if (!/^\d{6}$/.test(code)) throw new ContentError("Enter the six-digit code sent to your email.");
  const result = await mutateProgramme((state) => {
    const partner = requirePartner(state, token);
    if (partner.emailVerifiedAt) return { partner: accountDetails(partner), error: "" };
    if (!partner.otpHash || partner.otpExpiresAt <= Date.now() || partner.otpAttempts >= 5) return { partner: null, error: "This code has expired or reached its attempt limit. Request another code." };
    partner.otpAttempts++;
    if (!timingSafeEqual(Buffer.from(partner.otpHash, "hex"), Buffer.from(otpDigest(partner.id, code), "hex"))) return { partner: null, error: "The verification code is incorrect." };
    partner.emailVerifiedAt = new Date().toISOString(); partner.otpHash = null; audit(state, "partner-email-verified", partner.id);
    return { partner: accountDetails(partner), error: "" };
  });
  if (result.error) throw new ContentError(result.error);
  return result.partner!;
}
export const signOutPartner = (token: string) => mutateProgramme((state) => {
  const hash = digest(token); for (const partner of state.partners) partner.sessions = partner.sessions.filter((item) => item.hash !== hash);
});

function profileFields(input: Record<string, unknown>): PartnerProfile {
  const dob = textField(input.dob, "date of birth", 10, true); const date = new Date(`${dob}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dob || dob > new Date().toISOString().slice(0, 10)) throw new ContentError("Enter a valid date of birth that is not in the future.");
  const accountNumber = textField(input.accountNumber, "account number", 34, true);
  if (!/^[A-Za-z0-9 -]{6,34}$/.test(accountNumber)) throw new ContentError("Enter a valid account number, keeping any leading zeros.");
  return { phone: textField(input.phone, "phone number", 40, true), accountNumber, location: textField(input.location, "location", 300, true), dob, occupation: textField(input.occupation, "occupation", 120, true), nationality: textField(input.nationality, "origin / nationality", 120, true) };
}
function profilePhoto(value: unknown) {
  const data = textField(value, "profile photo", 1450000);
  if (!data) return "";
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(data);
  if (!match) throw new ContentError("Choose a JPG, PNG or WebP profile photo under 1 MB.");
  const bytes = Buffer.from(match[2], "base64");
  const valid = match[1] === "jpeg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : match[1] === "png" ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (bytes.length > 1024 * 1024 || !valid) throw new ContentError("Choose a valid JPG, PNG or WebP profile photo under 1 MB.");
  return data;
}
export async function savePartnerProfile(token: string, input: Record<string, unknown>) {
  const fields = profileFields(input); const state = await readProgramme(); const found = requirePartner(state, token);
  if (!found.emailVerifiedAt) throw new ContentError("Verify your email before entering personal details.", 403);
  const password = input.newPassword ? passwordField(input.newPassword) : null;
  if (password && !await passwordMatches(found, input.currentPassword)) throw new ContentError("Enter your current password to change your password.");
  const salt = password ? randomBytes(16).toString("hex") : null; const passwordHash = password ? await derive(password, salt!) : null;
  const fullName = input.fullName === undefined ? found.fullName : textField(input.fullName, "full name", 120, true);
  const username = input.username === undefined ? found.username : textField(input.username, "username", 20, true).toLowerCase();
  if (!/^[a-z][a-z0-9_]{2,19}$/.test(username)) throw new ContentError("Choose a username of 3–20 lowercase letters, numbers or underscores, starting with a letter.");
  const photoDataUrl = input.photoDataUrl === undefined ? found.photoDataUrl : profilePhoto(input.photoDataUrl);
  return mutateProgramme((current) => {
    const partner = requirePartner(current, token);
    if (partner.passwordHash !== found.passwordHash || !partner.emailVerifiedAt) throw new ContentError("Sign in again to update your profile.", 401);
    if (current.partners.some((item) => item.id !== partner.id && item.aliases.includes(username))) throw new ContentError("That username is already reserved.", 409);
    Object.assign(partner, fields, { fullName, username, photoDataUrl, profileCompletedAt: new Date().toISOString() });
    if (!partner.aliases.includes(username)) partner.aliases.push(username);
    let nextToken: string | null = null;
    if (passwordHash && salt) { const next = session(); partner.passwordHash = passwordHash; partner.passwordSalt = salt; partner.sessions = [next.stored]; nextToken = next.token; }
    return { partner: accountDetails(partner), token: nextToken };
  });
}

export function paymentReserved(payment: PartnerPayment) {
  return ["initializing", "pending"].includes(payment.status) && Date.parse(payment.expiresAt) > Date.now();
}
export function promoUsage(state: ProgrammeState, promoId: string) {
  return { uses: state.payments.filter((item) => item.promoId === promoId && item.entitledAt).length, reserved: state.payments.filter((item) => item.promoId === promoId && paymentReserved(item)).length };
}
export function buildPartnerQuote(state: ProgrammeState, partner: PartnerRecord, input: Record<string, unknown>) {
  if (!partner.emailVerifiedAt || !partner.profileCompletedAt) throw new ContentError("Verify your email and complete your personal details before selecting a tier.", 403);
  const tier = state.tiers.find((item) => item.id === input.tierId && item.active);
  if (!tier) throw new ContentError("Choose an available partner tier.");
  const currentTier = partner.currentTierId ? state.tiers.find((item) => item.id === partner.currentTierId) : null;
  if (currentTier && !activePartner(state, partner)) throw new ContentError("This membership needs review before upgrading. Please contact De Jadon Group.", 403);
  if (currentTier && tier.rank <= currentTier.rank) throw new ContentError("Choose a higher tier to upgrade.");
  const kind = currentTier ? "upgrade" : "registration";
  const code = textField(input.promoCode, "promo code", 40).toUpperCase();
  if (kind === "upgrade" && code) throw new ContentError("Promo codes apply to initial registration only.");
  const promo = code ? state.promos.find((item) => item.code === code) : null;
  const baseKobo = currentTier ? Math.max(0, tier.feeKobo - currentTier.feeKobo) : tier.feeKobo;
  if (code) {
    if (!promo || !promo.active || !promo.tierIds.includes(tier.id) || promo.startsAt && Date.parse(promo.startsAt) > Date.now() || promo.endsAt && Date.parse(promo.endsAt) <= Date.now()) throw new ContentError("This promo code is inactive, expired, or not eligible for the selected tier.");
    if (promo.eligibleEmails.length && !promo.eligibleEmails.includes(partner.email)) throw new ContentError("This promo code is not available for your email address.");
    const usage = promoUsage(state, promo.id);
    if (promo.maxUses && usage.uses + usage.reserved >= promo.maxUses) throw new ContentError("This promo code has reached its usage limit.");
    if (state.payments.filter((item) => item.promoId === promo.id && item.partnerId === partner.id && (item.entitledAt || paymentReserved(item))).length >= promo.perPartnerLimit) throw new ContentError("You have reached the usage limit for this promo code.");
  }
  const discountKobo = promo ? Math.min(baseKobo, promo.type === "percent" ? Math.floor(baseKobo * promo.value / 100) : promo.value) : 0;
  const verificationFeeKobo = kind === "registration" && promo && discountKobo === baseKobo ? 10000 : 0;
  const quote = { tierId: tier.id, tierName: tier.name, fromTierId: currentTier?.id || null, kind, baseKobo, discountKobo, verificationFeeKobo, amountKobo: baseKobo - discountKobo + verificationFeeKobo, promoCode: code } as Omit<PartnerQuote, "fingerprint">;
  const fingerprint = digest(JSON.stringify({ ...quote, tierUpdated: tier.updatedAt, currentUpdated: currentTier?.updatedAt, promoUpdated: promo?.updatedAt }));
  return { quote: { ...quote, fingerprint }, promo };
}
export async function getPartnerQuote(token: string, input: Record<string, unknown>) {
  const state = await readProgramme(); return buildPartnerQuote(state, requirePartner(state, token), input).quote;
}

export async function savePartnerTier(input: Record<string, unknown>, id?: string) {
  const name = textField(input.name, "tier name", 100, true); const description = textField(input.description, "tier description", 1000);
  const rank = integerField(input.rank, "Tier order", 1, 1000); const feeKobo = moneyField(input.fee, "registration fee");
  if (!Array.isArray(input.benefits) || input.benefits.length > 20) throw new ContentError("Add up to 20 benefits per tier.");
  const benefits = input.benefits.map((item: Record<string, unknown>) => {
    if (!item || typeof item !== "object") throw new ContentError("Check the benefit details.");
    return { id: textField(item.id, "benefit ID", 80) || randomUUID(), title: textField(item.title, "benefit title", 120, true), summary: textField(item.summary, "benefit summary", 500), content: textField(item.content, "benefit content", 8000) };
  });
  if (new Set(benefits.map((item) => item.id)).size !== benefits.length) throw new ContentError("Each benefit needs a unique ID.");
  return mutateProgramme((state) => {
    const current = id ? state.tiers.find((item) => item.id === id) : null;
    if (id && !current) throw new ContentError("Tier not found.", 404);
    if (state.tiers.some((item) => item.id !== id && item.rank === rank)) throw new ContentError("Another tier already uses this tier order.", 409);
    const now = new Date().toISOString();
    const tier: PartnerTier = { id: current?.id || randomUUID(), name, description, rank, feeKobo, active: input.active === true, benefits, createdAt: current?.createdAt || now, updatedAt: now };
    state.tiers = current ? state.tiers.map((item) => item.id === id ? tier : item) : [...state.tiers, tier];
    audit(state, "super-admin-tier-saved", tier.id); return tier;
  });
}
export async function savePartnerPromo(input: Record<string, unknown>, id?: string) {
  const code = textField(input.code, "promo code", 40, true).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(code)) throw new ContentError("Use 3–40 letters, numbers, hyphens or underscores for the promo code.");
  if (input.type !== "percent" && input.type !== "fixed") throw new ContentError("Choose a percentage or fixed discount.");
  const value = input.type === "fixed" ? moneyField(input.value, "discount") : Number(input.value);
  if (!Number.isFinite(value) || value <= 0 || input.type === "percent" && (value > 100 || !/^\d{1,3}(?:\.\d{1,2})?$/.test(String(input.value)))) throw new ContentError("Enter a positive discount; percentages must be at most 100 with up to two decimal places.");
  if (!Array.isArray(input.tierIds) || !input.tierIds.length || input.tierIds.some((item) => typeof item !== "string")) throw new ContentError("Select at least one eligible tier.");
  const tierIds = [...new Set(input.tierIds)] as string[];
  const startsAt = isoField(input.startsAt, "start date"); const endsAt = isoField(input.endsAt, "expiry date");
  if (startsAt && endsAt && startsAt >= endsAt) throw new ContentError("The promo expiry must be after its start date.");
  const maxUses = integerField(input.maxUses ?? 0, "Total usage limit", 0, 1000000);
  const perPartnerLimit = integerField(input.perPartnerLimit ?? 1, "Per-partner usage limit", 1, 100);
  if (!Array.isArray(input.eligibleEmails) || input.eligibleEmails.length > 500) throw new ContentError("Add up to 500 eligible emails, or leave the list empty for all partners.");
  const eligibleEmails = [...new Set(input.eligibleEmails.map(emailField))];
  return mutateProgramme((state) => {
    const current = id ? state.promos.find((item) => item.id === id) : null;
    if (id && !current) throw new ContentError("Promo code not found.", 404);
    if (state.promos.some((item) => item.id !== id && item.code === code)) throw new ContentError("This promo code already exists.", 409);
    if (tierIds.some((tierId) => !state.tiers.some((tier) => tier.id === tierId))) throw new ContentError("Choose valid eligible tiers.");
    const usage = current ? promoUsage(state, current.id) : { uses: 0, reserved: 0 };
    if (maxUses && maxUses < usage.uses + usage.reserved) throw new ContentError("The limit cannot be lower than confirmed uses and current checkout reservations.");
    const now = new Date().toISOString();
    const promo: PartnerPromo = { id: current?.id || randomUUID(), code, type: input.type as PartnerPromo["type"], value, tierIds, active: input.active === true, startsAt, endsAt, maxUses, perPartnerLimit, eligibleEmails, createdAt: current?.createdAt || now, updatedAt: now };
    state.promos = current ? state.promos.map((item) => item.id === id ? promo : item) : [...state.promos, promo];
    audit(state, "super-admin-promo-saved", promo.id); return promo;
  });
}
export async function getAdminPartnerProgramme() {
  const state = await readProgramme();
  return {
    tiers: state.tiers.slice().sort((a, b) => a.rank - b.rank), promos: state.promos.map((promo) => ({ ...promo, ...promoUsage(state, promo.id) })),
    partners: state.partners.map(({ id, fullName, email, emailVerifiedAt, profileCompletedAt, registeredAt, currentTierId }) => ({ id, fullName, email, emailVerifiedAt, profileCompletedAt, registeredAt, currentTierId })),
    payments: state.payments.slice().reverse(), audit: state.audit.slice(-100).reverse()
  };
}
