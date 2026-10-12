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

export function readLegacyPreviewProfile(role: DashboardRole): PreviewProfile | null {
  const raw = localStorage.getItem(profileKey(role));
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isProfile(value, role) ? value : null;
  } catch {
    return null;
  }
}
