import { createPreviewProfile, readLegacyPreviewProfile, type PreviewProfile } from "@/lib/preview-profile";
import type { DashboardRole } from "@/types/site";

export type PreviewAccount = PreviewProfile & {
  passwordSalt: string;
  passwordHash: string;
};

type Result = { ok: true; account: PreviewAccount } | { ok: false; message: string };

const accountsKey = "dejadon-preview-accounts-v1";
const legacySessionKey = "dejadon-preview-session-v1";
const sessionKey = (role: DashboardRole) => `dejadon-preview-session-v2:${role}`;
const reservationsKey = "dejadon-preview-usernames-v1";
const usernamePattern = /^[a-z][a-z0-9_]{2,19}$/;

function isAccount(value: unknown): value is PreviewAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Partial<PreviewAccount>;
  return typeof account.id === "string" &&
    (account.role === "client" || account.role === "partner") &&
    typeof account.fullName === "string" &&
    typeof account.username === "string" &&
    typeof account.email === "string" &&
    typeof account.phone === "string" &&
    typeof account.photoDataUrl === "string" &&
    typeof account.passwordSalt === "string" &&
    typeof account.passwordHash === "string";
}

function readAccounts(): PreviewAccount[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(accountsKey) || "[]");
    return Array.isArray(value) ? value.filter(isAccount) : [];
  } catch {
    return [];
  }
}

function readReservations(): Record<string, string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(reservationsKey) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  } catch {
    return {};
  }
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, saltHex: string) {
  const salt = Uint8Array.from(saltHex.match(/.{2}/g) || [], (part) => parseInt(part, 16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}

function validateDetails(fullName: string, username: string, email: string) {
  if (fullName.length < 2 || fullName.length > 80) return "Enter your full name (2–80 characters).";
  if (!usernamePattern.test(username)) return "Use 3–20 lowercase letters, numbers, or underscores, starting with a letter.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  return "";
}

export function getCurrentPreviewAccount(role: DashboardRole): PreviewAccount | null {
  try {
    let id = sessionStorage.getItem(sessionKey(role));
    if (!id) {
      const legacyId = sessionStorage.getItem(legacySessionKey);
      const legacyAccount = readAccounts().find((account) => account.id === legacyId && account.role === role);
      if (legacyAccount) {
        id = legacyAccount.id;
        sessionStorage.setItem(sessionKey(role), id);
        sessionStorage.removeItem(legacySessionKey);
      }
    }
    if (!id) return null;
    return readAccounts().find((account) => account.id === id && account.role === role) || null;
  } catch {
    return null;
  }
}

export function signOutPreviewAccount(role: DashboardRole) {
  getCurrentPreviewAccount(role);
  sessionStorage.removeItem(sessionKey(role));
}

export async function registerPreviewAccount(input: {
  role: DashboardRole;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}): Promise<Result> {
  const fullName = input.fullName.trim();
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const validation = validateDetails(fullName, username, email);
  if (validation) return { ok: false, message: validation };
  if (input.password.length < 8) return { ok: false, message: "Use a password with at least 8 characters." };

  const accounts = readAccounts();
  if (accounts.some((account) => account.role === input.role && account.email === email)) {
    return { ok: false, message: "An account with this email already exists for this portal. Sign in instead." };
  }

  // A matching earlier browser preview can keep its photo, phone, and ID.
  const legacy = readLegacyPreviewProfile(input.role);
  const canImport = legacy?.username === username && !accounts.some((account) => account.id === legacy.id);
  const base = canImport && legacy ? legacy : createPreviewProfile(input.role);
  const reservations = readReservations();
  if ((reservations[username] && reservations[username] !== base.id) ||
      accounts.some((account) => account.username === username && account.id !== base.id)) {
    return { ok: false, message: "This username has already been chosen in this browser." };
  }

  try {
    const passwordSalt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
    const passwordHash = await hashPassword(input.password, passwordSalt);
    const account: PreviewAccount = {
      ...base,
      fullName,
      username,
      email,
      phone: phone || base.phone,
      passwordSalt,
      passwordHash
    };
    localStorage.setItem(accountsKey, JSON.stringify([...accounts, account]));
    localStorage.setItem(reservationsKey, JSON.stringify({ ...reservations, [username]: account.id }));
    sessionStorage.setItem(sessionKey(input.role), account.id);
    return { ok: true, account };
  } catch {
    return { ok: false, message: "This browser could not save the account. Check storage and try again." };
  }
}

export async function signInPreviewAccount(role: DashboardRole, emailValue: string, password: string): Promise<Result> {
  const email = emailValue.trim().toLowerCase();
  const account = readAccounts().find((candidate) => candidate.role === role && candidate.email === email);
  if (!account) return { ok: false, message: "No account with that email was found for this portal." };
  try {
    if (await hashPassword(password, account.passwordSalt) !== account.passwordHash) {
      return { ok: false, message: "Incorrect password." };
    }
    sessionStorage.setItem(sessionKey(role), account.id);
    return { ok: true, account };
  } catch {
    return { ok: false, message: "Sign-in is unavailable in this browser." };
  }
}

export function updatePreviewAccount(accountId: string, changes: Pick<PreviewAccount, "fullName" | "username" | "email" | "phone" | "photoDataUrl">): Result {
  const accounts = readAccounts();
  const account = accounts.find((candidate) => candidate.id === accountId);
  if (!account || getCurrentPreviewAccount(account.role)?.id !== accountId) return { ok: false, message: "Sign in again to edit this profile." };

  const fullName = changes.fullName.trim();
  const username = changes.username.trim().toLowerCase();
  const email = changes.email.trim().toLowerCase();
  const validation = validateDetails(fullName, username, email);
  if (validation) return { ok: false, message: validation };
  if (accounts.some((candidate) => candidate.id !== accountId && candidate.role === account.role && candidate.email === email)) {
    return { ok: false, message: "This email is already used in this portal." };
  }
  const reservations = readReservations();
  if ((reservations[username] && reservations[username] !== accountId) ||
      accounts.some((candidate) => candidate.id !== accountId && candidate.username === username)) {
    return { ok: false, message: "This username has already been chosen in this browser." };
  }

  try {
    const updated = { ...account, ...changes, fullName, username, email, phone: changes.phone.trim() };
    localStorage.setItem(accountsKey, JSON.stringify(accounts.map((candidate) => candidate.id === accountId ? updated : candidate)));
    // Keep old entries: a previously chosen username never becomes available to another account.
    localStorage.setItem(reservationsKey, JSON.stringify({ ...reservations, [username]: accountId }));
    return { ok: true, account: updated };
  } catch {
    return { ok: false, message: "This browser could not save your changes." };
  }
}
