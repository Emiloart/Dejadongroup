import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSameOrigin, adminCookieOptions } from "@/lib/admin-auth";
import { ContentError } from "@/lib/content-api";
import { clientSessionSeconds, getClientForSession } from "@/lib/client-store";
import { readLimitedBody } from "@/lib/request-body";

export const clientCookieName = "dejadon-client";
export const currentClientToken = () => cookies().get(clientCookieName)?.value;
export const getCurrentClient = () => getClientForSession(currentClientToken());

export async function readClientBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const input: unknown = JSON.parse((await readLimitedBody(request, 64 * 1024)).toString("utf8"));
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error();
    return input as Record<string, unknown>;
  } catch { throw new ContentError("Check the form and try again."); }
}

export function setClientCookie(response: NextResponse, token: string) {
  response.cookies.set(clientCookieName, token, { ...adminCookieOptions, maxAge: clientSessionSeconds });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

const attempts = new Map<string, { count: number; reset: number }>();
export function checkClientAuthRequest(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Refresh the page and try again." }, { status: 403 });
  const now = Date.now();
  for (const [key, value] of attempts) if (value.reset <= now) attempts.delete(key);
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const entry = attempts.get(key) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (entry.count >= 15) return NextResponse.json({ error: "Too many attempts. Please try again in 15 minutes." }, { status: 429 });
  entry.count++;
  if (attempts.size < 10000 || attempts.has(key)) attempts.set(key, entry);
  return null;
}
