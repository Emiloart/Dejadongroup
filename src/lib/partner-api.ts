import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { adminCookieOptions, isAdminAuthenticated, isSameOrigin, isSuperAdminAuthenticated } from "@/lib/admin-auth";
import { ContentError } from "@/lib/content-api";
import { readLimitedBody } from "@/lib/request-body";
import { getPartnerView, partnerSessionSeconds } from "@/lib/partner-store";

export const partnerCookieName = "dejadon-partner";
export const currentPartnerToken = () => cookies().get(partnerCookieName)?.value;
export const getCurrentPartnerView = () => getPartnerView(currentPartnerToken());
export function partnerCookie(response: NextResponse, token: string) {
  response.cookies.set(partnerCookieName, token, { ...adminCookieOptions, maxAge: partnerSessionSeconds });
  return response;
}
export const partnerJson = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function readPartnerBody(request: Request, profile = false): Promise<Record<string, unknown>> {
  try {
    const body: unknown = JSON.parse((await readLimitedBody(request, profile ? 2 * 1024 * 1024 : 256 * 1024)).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch { throw new ContentError("Check the form and try again."); }
}
const attempts = new Map<string, { count: number; reset: number }>();
export function partnerWriteGuard(request: Request, scope: string, limit = 20) {
  if (!isSameOrigin(request)) return partnerJson({ error: "Refresh the page and try again." }, 403);
  const now = Date.now(); for (const [key, item] of attempts) if (item.reset <= now) attempts.delete(key);
  const key = `${scope}:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"}`;
  const entry = attempts.get(key) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (entry.count >= limit || attempts.size >= 10000 && !attempts.has(key)) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(Math.ceil((entry.reset - now) / 1000)), "Cache-Control": "no-store" } });
  entry.count++; attempts.set(key, entry); return null;
}
export function requireProgrammeSuperAdmin(request: Request, write = false) {
  if (!isAdminAuthenticated()) return partnerJson({ error: "Sign in to the admin workspace." }, 401);
  if (!isSuperAdminAuthenticated()) return partnerJson({ error: "Only the Super Admin can manage the Partner Programme, tiers and promo codes." }, 403);
  if (write && !isSameOrigin(request)) return partnerJson({ error: "Refresh the page and try again." }, 403);
  return null;
}
export function authorizedReconciliation(request: Request) {
  const secret = process.env.PARTNER_RECONCILE_SECRET;
  if (!secret || secret.length < 32) return false;
  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  const supplied = createHash("sha256").update(request.headers.get("authorization") || "").digest();
  return timingSafeEqual(expected, supplied);
}
