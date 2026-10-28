import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "dejadon-admin";
export const adminSessionSeconds = 8 * 60 * 60;

function credentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  return email && password && password.length >= 12 ? { email, password } : null;
}

export function isAdminConfigured() {
  return credentials() !== null;
}

function equal(value: string, expected: string) {
  return timingSafeEqual(createHash("sha256").update(value).digest(), createHash("sha256").update(expected).digest());
}

export function verifyAdminCredentials(email: string, password: string) {
  const configured = credentials();
  if (!configured) return false;
  const emailMatches = equal(email.trim().toLowerCase(), configured.email);
  const passwordMatches = equal(password, configured.password);
  return emailMatches && passwordMatches;
}

function signature(payload: string) {
  const configured = credentials();
  if (!configured) return "";
  const key = createHash("sha256").update(JSON.stringify(configured)).digest();
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createAdminSession() {
  const payload = Buffer.from(JSON.stringify({ expires: Date.now() + adminSessionSeconds * 1000, nonce: randomBytes(24).toString("hex") })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function isAdminAuthenticated() {
  if (!isAdminConfigured()) return false;
  const token = cookies().get(adminCookieName)?.value;
  if (!token || token.length > 512) return false;
  const [payload, supplied, extra] = token.split(".");
  if (!payload || !supplied || extra || !equal(supplied, signature(payload))) return false;
  try {
    const session: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return !!session && typeof session === "object" && "expires" in session &&
      typeof session.expires === "number" && session.expires > Date.now();
  } catch {
    return false;
  }
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const supplied = new URL(origin);
    const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || new URL(request.url).protocol.slice(0, -1);
    // Next can normalize its internal URL to localhost. The browser's Host and
    // forwarded protocol preserve the actual origin, including behind a proxy.
    return supplied.origin === origin && supplied.host === host.toLowerCase() && supplied.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};
