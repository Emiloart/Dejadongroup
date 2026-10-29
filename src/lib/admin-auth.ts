import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "dejadon-admin";
export const adminSessionSeconds = 8 * 60 * 60;

export type AdminRole = "super-admin" | "admin";
function credentials() {
  const superEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const superPassword = process.env.SUPER_ADMIN_PASSWORD;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const users: { email: string; password: string; role: AdminRole }[] = [];
  // An existing single-owner installation remains the Super Admin. Once explicit
  // Super Admin credentials are set, ADMIN_* becomes the ordinary admin account.
  if (superEmail && superPassword && superPassword.length >= 12) users.push({ email: superEmail, password: superPassword, role: "super-admin" });
  if (email && password && password.length >= 12) users.push({ email, password, role: superEmail || superPassword ? "admin" : "super-admin" });
  return users;
}

export function isAdminConfigured() {
  return credentials().length > 0;
}

function equal(value: string, expected: string) {
  return timingSafeEqual(createHash("sha256").update(value).digest(), createHash("sha256").update(expected).digest());
}

export function verifyAdminCredentials(email: string, password: string): AdminRole | null {
  let role: AdminRole | null = null;
  for (const configured of credentials()) {
    const emailMatches = equal(email.trim().toLowerCase(), configured.email);
    const passwordMatches = equal(password, configured.password);
    if (emailMatches && passwordMatches && role !== "super-admin") role = configured.role;
  }
  return role;
}

function signature(payload: string) {
  const configured = credentials();
  if (!configured.length) return "";
  const key = createHash("sha256").update(JSON.stringify(configured)).digest();
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createAdminSession(role: AdminRole) {
  const payload = Buffer.from(JSON.stringify({ role, expires: Date.now() + adminSessionSeconds * 1000, nonce: randomBytes(24).toString("hex") })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function currentAdminRole(): AdminRole | null {
  if (!isAdminConfigured()) return null;
  const token = cookies().get(adminCookieName)?.value;
  if (!token || token.length > 512) return null;
  const [payload, supplied, extra] = token.split(".");
  if (!payload || !supplied || extra || !equal(supplied, signature(payload))) return null;
  try {
    const session: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (session && typeof session === "object" && "expires" in session && typeof session.expires === "number" && session.expires > Date.now() && "role" in session && (session.role === "super-admin" || session.role === "admin")) return session.role;
    return null;
  } catch {
    return null;
  }
}

export const isAdminAuthenticated = () => currentAdminRole() !== null;
export const isSuperAdminAuthenticated = () => currentAdminRole() === "super-admin";

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
