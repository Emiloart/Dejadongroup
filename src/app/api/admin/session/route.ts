import { NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, adminSessionSeconds, isAdminConfigured, isSameOrigin } from "@/lib/admin-auth";
import { activateAdmin, authenticateAdmin, revokeAdminSession, AdminError } from "@/lib/admin-store";
import { currentAdminToken } from "@/lib/admin-auth";
import { readLimitedBody, RequestBodyTooLarge } from "@/lib/request-body";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; reset: number }>();

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Refresh the page and try again." }, { status: 403 });
  if (!await isAdminConfigured()) return NextResponse.json({ error: "Administrator access has not been set up yet." }, { status: 503 });
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  for (const [ip, entry] of attempts) if (entry.reset <= now) attempts.delete(ip);
  const entry = attempts.get(key) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (entry.count >= 10) return NextResponse.json({ error: "Too many sign-in attempts. Please try again in 15 minutes." }, { status: 429, headers: { "Retry-After": String(Math.ceil((entry.reset - now) / 1000)) } });
  entry.count++;
  if (attempts.size < 10000 || attempts.has(key)) attempts.set(key, entry);
  let input: unknown;
  try { input = JSON.parse((await readLimitedBody(request, 4096)).toString("utf8")); }
  catch (error) { return NextResponse.json({ error: error instanceof RequestBodyTooLarge ? "Invalid sign-in details." : "Enter your email and password." }, { status: 400 }); }
  if (!input || typeof input !== "object" || !("email" in input) || !("password" in input) || typeof input.email !== "string" || typeof input.password !== "string" || input.email.length > 254 || input.password.length > 128) return NextResponse.json({ error: "The email or password is incorrect." }, { status: 401 });
  try {
    const token = await authenticateAdmin(input.email, input.password);
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(adminCookieName, token, { ...adminCookieOptions, maxAge: adminSessionSeconds });
    return response;
  } catch (error) { return NextResponse.json({ error: error instanceof AdminError ? error.message : "Sign-in is temporarily unavailable." }, { status: error instanceof AdminError ? error.status : 503 }); }
}
export async function PUT(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Refresh the page and try again." }, { status: 403 });
  const key = `activate:${request.headers.get("x-forwarded-for") || "local"}`;
  const entry = attempts.get(key) || { count: 0, reset: Date.now() + 900000 };
  if (entry.reset < Date.now()) { entry.count = 0; entry.reset = Date.now() + 900000; }
  if (++entry.count > 10) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  if (attempts.size >= 10000 && !attempts.has(key)) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  attempts.set(key, entry);
  try { await activateAdmin(JSON.parse((await readLimitedBody(request, 4096)).toString("utf8"))); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof AdminError ? error.message : "Check the invitation and try again." }, { status: error instanceof AdminError ? error.status : 400 }); }
}
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Refresh the page and try again." }, { status: 403 });
  await revokeAdminSession(currentAdminToken());
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}
