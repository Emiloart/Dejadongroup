import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { ContentError } from "@/lib/content-api";
import { processStatuses, withdrawalStatuses, type AdminClient, type ClientDetails, type ClientProcess, type ClientWithdrawal } from "@/lib/client-types";
import { readCollection, updateCollection } from "@/lib/site-storage";

type ClientRecord = ClientDetails & {
  tokenHash: string | null;
  tokenExpiresAt: string | null;
  passwordSalt: string | null;
  passwordHash: string | null;
  sessions: { hash: string; expiresAt: number }[];
};

export const clientSessionSeconds = 8 * 60 * 60;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const readClients = () => readCollection<ClientRecord>("clients");

function safeDetails(record: ClientRecord): ClientDetails {
  const { tokenHash: _tokenHash, tokenExpiresAt: _tokenExpiresAt, passwordSalt: _passwordSalt, passwordHash: _passwordHash, sessions: _sessions, ...details } = record;
  return details;
}

function adminDetails(record: ClientRecord): AdminClient {
  return { ...safeDetails(record), tokenExpiresAt: record.tokenExpiresAt, tokenStatus: record.activatedAt ? "used" : !record.tokenHash ? "not-issued" : Date.parse(record.tokenExpiresAt || "") > Date.now() ? "issued" : "expired" };
}

export const getAdminClients = async () => (await readClients()).map(adminDetails);

function string(value: unknown, label: string, limit: number, required = false) {
  if (value !== undefined && value !== null && typeof value !== "string") throw new ContentError(`Invalid ${label}.`);
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) throw new ContentError(`Enter ${label}.`);
  if (result.length > limit) throw new ContentError(`${label} must be ${limit} characters or fewer.`);
  return result;
}

function email(value: unknown, required = true) {
  const result = string(value, "email address", 254, required).toLowerCase();
  if (result && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new ContentError("Enter a valid email address.");
  return result;
}

function date(value: unknown, label: string, required = false) {
  const result = string(value, label, 10, required);
  const parsed = new Date(`${result}T12:00:00Z`);
  if (result && (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== result)) throw new ContentError(`Enter a valid ${label}.`);
  return result;
}

function amount(value: unknown, label: string, nullable = false): number | null {
  if (nullable && (value === "" || value === null || value === undefined)) return null;
  const raw = String(value ?? "");
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(raw)) throw new ContentError(`Enter a valid ${label} with up to two decimal places.`);
  return Number(raw);
}

function details(input: Record<string, unknown>) {
  const progress = Number(input.investmentProgress ?? 0);
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) throw new ContentError("Investment progress must be between 0 and 100.");
  const processInput = input.processes ?? [];
  const withdrawalInput = input.withdrawals ?? [];
  if (!Array.isArray(processInput) || processInput.length > 20) throw new ContentError("Add up to 20 process steps.");
  if (!Array.isArray(withdrawalInput) || withdrawalInput.length > 50) throw new ContentError("Add up to 50 withdrawal records.");
  const processes: ClientProcess[] = processInput.map((item) => {
    if (!item || typeof item !== "object" || !processStatuses.includes(item.status)) throw new ContentError("Choose a valid process status.");
    return { id: string(item.id, "process ID", 80) || randomUUID(), title: string(item.title, "process title", 120, true), detail: string(item.detail, "process details", 500), status: item.status };
  });
  const withdrawals: ClientWithdrawal[] = withdrawalInput.map((item) => {
    if (!item || typeof item !== "object" || !withdrawalStatuses.includes(item.status)) throw new ContentError("Choose Pending, Processing or Successful for each withdrawal.");
    const value = amount(item.amount, "withdrawal amount")!;
    if (value <= 0) throw new ContentError("Withdrawal amounts must be greater than zero.");
    return { id: string(item.id, "withdrawal ID", 80) || randomUUID(), amount: value, date: date(item.date, "withdrawal date", true), reference: string(item.reference, "withdrawal reference", 120), note: string(item.note, "withdrawal note", 500), status: item.status };
  });
  if (new Set(processes.map((item) => item.id)).size !== processes.length || new Set(withdrawals.map((item) => item.id)).size !== withdrawals.length) throw new ContentError("Each process and withdrawal must have a unique record ID.");
  return {
    fullName: string(input.fullName, "full name", 120, true), email: email(input.email, false), phone: string(input.phone, "phone number", 40),
    verified: input.verified === true,
    propertyName: string(input.propertyName, "property name", 200), propertyLocation: string(input.propertyLocation, "property location", 500), propertyReference: string(input.propertyReference, "property reference", 120),
    investmentName: string(input.investmentName, "investment plan", 200), investmentDetails: string(input.investmentDetails, "investment details", 3000), investmentProgress: progress,
    actualDateLabel: string(input.actualDateLabel, "date label", 100) || "Actual Date", actualDate: date(input.actualDate, "actual date"),
    balance: amount(input.balance, "balance", true), processes, withdrawals
  };
}

export function saveClientRecord(input: Record<string, unknown>, id?: string) {
  const data = details(input);
  return updateCollection<ClientRecord, AdminClient>("clients", (items) => {
    const current = id ? items.find((item) => item.id === id) : undefined;
    if (id && !current) throw new ContentError("Client not found.", 404);
    if (current?.activatedAt && data.email !== current.email) throw new ContentError("A registered client manages their email from their profile.");
    if (data.email && items.some((item) => item.id !== id && item.email === data.email)) throw new ContentError("This email is already assigned to another client.", 409);
    const now = new Date().toISOString();
    const record: ClientRecord = current ? { ...current, ...data, updatedAt: now, ...(!data.verified ? { tokenHash: null, tokenExpiresAt: null, sessions: [] } : {}) } : {
      ...data, id: randomUUID(), createdAt: now, updatedAt: now, activatedAt: null, tokenHash: null, tokenExpiresAt: null, passwordSalt: null, passwordHash: null, sessions: []
    };
    return { items: current ? items.map((item) => item.id === id ? record : item) : [...items, record], result: adminDetails(record) };
  });
}

export function issueClientToken(id: string, revoke = false) {
  return updateCollection<ClientRecord, { client: AdminClient; token: string | null }>("clients", (items) => {
    const record = items.find((item) => item.id === id);
    if (!record) throw new ContentError("Client not found.", 404);
    if (record.activatedAt) throw new ContentError("This client has already activated their account.");
    if (!record.verified) throw new ContentError("Verify and save the client’s information before issuing a token.");
    const token = revoke ? null : `DJ-${randomBytes(24).toString("hex").toUpperCase()}`;
    record.tokenHash = token ? hash(token) : null;
    record.tokenExpiresAt = token ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null;
    record.updatedAt = new Date().toISOString();
    return { items, result: { client: adminDetails(record), token } };
  });
}

function passwordValue(value: unknown) {
  if (typeof value !== "string" || value.length < 10 || value.length > 128) throw new ContentError("Use a password with 10–128 characters.");
  return value;
}

function derive(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, { N: 65536, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key.toString("hex"))));
}

async function passwordMatches(record: ClientRecord, password: unknown) {
  if (typeof password !== "string" || password.length > 128 || !record.passwordSalt || !record.passwordHash) return false;
  const candidate = await derive(password, record.passwordSalt);
  return timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(record.passwordHash, "hex"));
}

function session() {
  const token = randomBytes(32).toString("base64url");
  return { token, stored: { hash: hash(token), expiresAt: Date.now() + clientSessionSeconds * 1000 } };
}

function usableToken(record: ClientRecord, tokenHash: string) {
  return (!record.accessStatus || record.accessStatus === "active") && record.verified && !record.activatedAt && record.tokenHash === tokenHash && Date.parse(record.tokenExpiresAt || "") > Date.now();
}

export async function activateClient(input: Record<string, unknown>) {
  const token = string(input.token, "activation token", 100, true).toUpperCase();
  const address = email(input.email);
  const password = passwordValue(input.password);
  const tokenHash = hash(token);
  const found = (await readClients()).find((item) => usableToken(item, tokenHash));
  if (!found || found.email && found.email !== address) throw new ContentError("This token is invalid, expired, already used, or does not match your verified email.", 400);
  const salt = randomBytes(16).toString("hex");
  const passwordHash = await derive(password, salt);
  return updateCollection<ClientRecord, { client: ClientDetails; token: string }>("clients", (items) => {
    const record = items.find((item) => item.id === found.id);
    if (!record || !usableToken(record, tokenHash) || record.email && record.email !== address) throw new ContentError("This token is no longer available. Contact De Jadon Group for help.");
    if (items.some((item) => item.id !== record.id && item.email === address)) throw new ContentError("This email is already assigned to another client.", 409);
    const current = session();
    record.email = address; record.passwordSalt = salt; record.passwordHash = passwordHash;
    record.activatedAt = new Date().toISOString(); record.updatedAt = record.activatedAt;
    record.tokenHash = null; record.sessions = [current.stored];
    return { items, result: { client: safeDetails(record), token: current.token } };
  });
}

export async function signInClient(input: Record<string, unknown>) {
  const address = email(input.email);
  const found = (await readClients()).find((item) => item.email === address && item.activatedAt && item.verified && (!item.accessStatus || item.accessStatus === "active"));
  const matches = found ? await passwordMatches(found, input.password) : (await derive(typeof input.password === "string" ? input.password.slice(0, 128) : "", "dejadon-client-signin"), false);
  if (!found || !matches) throw new ContentError("The email or password is incorrect.", 401);
  return updateCollection<ClientRecord, { client: ClientDetails; token: string }>("clients", (items) => {
    const record = items.find((item) => item.id === found.id);
    if (!record?.verified || record.accessStatus && record.accessStatus !== "active" || record.passwordHash !== found.passwordHash) throw new ContentError("Sign in again with your current password.", 401);
    const current = session();
    record.sessions = [...record.sessions.filter((item) => item.expiresAt > Date.now()).slice(-4), current.stored];
    return { items, result: { client: safeDetails(record), token: current.token } };
  });
}

export async function getClientForSession(token: string | undefined) {
  if (!token || token.length > 100) return null;
  const tokenHash = hash(token);
  const found = (await readClients()).find((item) => item.verified && (!item.accessStatus || item.accessStatus === "active") && item.activatedAt && item.sessions.some((current) => current.hash === tokenHash && current.expiresAt > Date.now()));
  return found ? safeDetails(found) : null;
}

export function signOutClient(token: string | undefined) {
  return updateCollection<ClientRecord, boolean>("clients", (items) => {
    if (token) for (const record of items) record.sessions = record.sessions.filter((current) => current.hash !== hash(token));
    return { items, result: true };
  });
}

export async function updateClientProfile(token: string, input: Record<string, unknown>) {
  const found = await getClientForSession(token);
  if (!found) throw new ContentError("Sign in again to update your profile.", 401);
  const address = email(input.email);
  const phone = string(input.phone, "phone number", 40);
  const newPassword = input.newPassword ? passwordValue(input.newPassword) : null;
  const record = (await readClients()).find((item) => item.id === found.id)!;
  if ((address !== found.email || newPassword) && !await passwordMatches(record, input.currentPassword)) throw new ContentError("Enter your current password to change your email or password.");
  const salt = newPassword ? randomBytes(16).toString("hex") : null;
  const passwordHash = newPassword ? await derive(newPassword, salt!) : null;
  return updateCollection<ClientRecord, { client: ClientDetails; token: string | null }>("clients", (items) => {
    const current = items.find((item) => item.id === found.id);
    if (!current?.verified || !current.sessions.some((item) => item.hash === hash(token) && item.expiresAt > Date.now()) || current.passwordHash !== record.passwordHash || current.email !== found.email) throw new ContentError("Sign in again to update your profile.", 401);
    if (items.some((item) => item.id !== current.id && item.email === address)) throw new ContentError("This email is already assigned to another client.", 409);
    current.email = address; current.phone = phone; current.updatedAt = new Date().toISOString();
    let nextToken: string | null = null;
    if (passwordHash && salt) {
      const next = session(); current.passwordSalt = salt; current.passwordHash = passwordHash; current.sessions = [next.stored]; nextToken = next.token;
    }
    return { items, result: { client: safeDetails(current), token: nextToken } };
  });
}
