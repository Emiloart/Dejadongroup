import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { adminCookieOptions, isSameOrigin } from "@/lib/admin-auth";
import { ContentError } from "@/lib/content-api";
import { readLimitedBody } from "@/lib/request-body";
import { getPartnerView, partnerSessionSeconds } from "@/lib/partner-store";
import { consumeAttempt } from "@/lib/attempt-limiter";

export const partnerCookieName = "dejadon-partner";
export const currentPartnerToken = async () => (await cookies()).get(partnerCookieName)?.value;
export const getCurrentPartnerView = async () => getPartnerView(await currentPartnerToken());
export function partnerCookie(response: NextResponse, token: string) {
  response.cookies.set(partnerCookieName, token, { ...adminCookieOptions, maxAge: partnerSessionSeconds });
  return response;
}
export const partnerJson = (body: unknown, status = 200) => NextResponse.json(JSON.parse(JSON.stringify(body, (key, value) => key === "tierSnapshot" || key === "snapshotOrigin" ? undefined : value)), { status, headers: { "Cache-Control": "no-store" } });
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
  const key = `${scope}:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"}`;
  const attempt = consumeAttempt(attempts, key, limit, 15 * 60 * 1000);
  if (!attempt.allowed) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(Math.ceil((attempt.reset - Date.now()) / 1000)), "Cache-Control": "no-store" } });
  return null;
}
export function authorizedReconciliation(request: Request) {
  const secret = process.env.PARTNER_RECONCILE_SECRET;
  if (!secret || secret.length < 32) return false;
  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  const supplied = createHash("sha256").update(request.headers.get("authorization") || "").digest();
  return timingSafeEqual(expected, supplied);
}
