import { ContentError } from "@/lib/content-api";

export function textField(value: unknown, label: string, max: number, required = false) {
  if (value !== undefined && value !== null && typeof value !== "string") throw new ContentError(`Invalid ${label}.`);
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) throw new ContentError(`Enter ${label}.`);
  if (result.length > max) throw new ContentError(`${label} must be ${max} characters or fewer.`);
  return result;
}
export function emailField(value: unknown) {
  const email = textField(value, "email address", 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ContentError("Enter a valid email address.");
  return email;
}
export function moneyField(value: unknown, label = "amount") {
  const raw = String(value ?? "");
  if (!/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(raw)) throw new ContentError(`Enter a valid ${label} in NGN with up to two decimal places.`);
  return Math.round(Number(raw) * 100);
}
export function integerField(value: unknown, label: string, min: number, max: number) {
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < min || result > max) throw new ContentError(`${label} must be a whole number from ${min} to ${max}.`);
  return result;
}
export function isoField(value: unknown, label: string) {
  const raw = textField(value, label, 40);
  if (!raw) return "";
  const date = new Date(raw);
  if (!Number.isFinite(date.getTime())) throw new ContentError(`Enter a valid ${label}.`);
  return date.toISOString();
}
export function passwordField(value: unknown) {
  if (typeof value !== "string" || value.length < 10 || value.length > 128) throw new ContentError("Use a password with 10–128 characters.");
  return value;
}
