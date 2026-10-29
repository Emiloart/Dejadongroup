import { cookies } from "next/headers";
import { bootstrapConfigured, readAdministration, resolveAdmin } from "@/lib/admin-store";
export { adminSessionSeconds } from "@/lib/admin-store";
export const adminCookieName = "dejadon-admin";
export const currentAdminToken = () => cookies().get(adminCookieName)?.value;
export const currentAdmin = () => resolveAdmin(currentAdminToken());
export const isAdminConfigured = async () => bootstrapConfigured() || (await readAdministration()).bootstrapped;
export const isAdminAuthenticated = async () => Boolean(await currentAdmin());

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
