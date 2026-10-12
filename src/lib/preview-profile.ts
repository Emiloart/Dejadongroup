import type { DashboardRole } from "@/types/site";

export type PreviewProfile = {
  id: string;
  role: DashboardRole;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  photoDataUrl: string;
};

const profileKey = (role: DashboardRole) => "dejadon-preview-profile-v1:" + role;
const reservationsKey = "dejadon-preview-usernames-v1";

function isProfile(value: unknown, role: DashboardRole): value is PreviewProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<PreviewProfile>;
  return profile.role === role &&
    typeof profile.id === "string" &&
    typeof profile.fullName === "string" &&
    typeof profile.username === "string" &&
    typeof profile.email === "string" &&
    typeof profile.phone === "string" &&
    typeof profile.photoDataUrl === "string";
}

export function createPreviewProfile(role: DashboardRole): PreviewProfile {
  const id = Array.from(crypto.getRandomValues(new Uint8Array(6)), (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  return { id: "DJ-" + (role === "partner" ? "P" : "C") + "-" + id, role, fullName: "", username: "", email: "", phone: "", photoDataUrl: "" };
}

export function readPreviewProfile(role: DashboardRole): PreviewProfile | null {
  const raw = localStorage.getItem(profileKey(role));
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isProfile(value, role) ? value : null;
  } catch {
    return null;
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

export function savePreviewProfile(profile: PreviewProfile): { ok: true } | { ok: false; message: string } {
  const current = readPreviewProfile(profile.role);
  const username = profile.username.trim().toLowerCase();
  if (current?.username && current.username !== username) {
    return { ok: false, message: "This username is already locked for your preview account." };
  }
  if (!/^[a-z][a-z0-9_]{2,19}$/.test(username)) {
    return { ok: false, message: "Use 3–20 lowercase letters, numbers, or underscores, starting with a letter." };
  }
  if (profile.fullName.trim().length < 2 || profile.fullName.trim().length > 80) {
    return { ok: false, message: "Enter your full name (2–80 characters)." };
  }

  const reservations = readReservations();
  const owner = reservations[username];
  const otherRole: DashboardRole = profile.role === "partner" ? "client" : "partner";
  const otherProfile = readPreviewProfile(otherRole);
  if ((owner && owner !== profile.id) || (otherProfile?.username === username && otherProfile.id !== profile.id)) {
    return { ok: false, message: "This username has already been chosen in this browser." };
  }

  try {
    const saved = { ...profile, fullName: profile.fullName.trim(), username, email: profile.email.trim(), phone: profile.phone.trim() };
    localStorage.setItem(profileKey(profile.role), JSON.stringify(saved));
    localStorage.setItem(reservationsKey, JSON.stringify({ ...reservations, [username]: profile.id }));
    return { ok: true };
  } catch {
    return { ok: false, message: "Your browser could not save this profile. Check available storage and try again." };
  }
}

export function initializePreviewProfile(role: DashboardRole): PreviewProfile {
  const existing = readPreviewProfile(role);
  if (existing) return existing;
  const profile = createPreviewProfile(role);
  localStorage.setItem(profileKey(role), JSON.stringify(profile));
  return profile;
}
