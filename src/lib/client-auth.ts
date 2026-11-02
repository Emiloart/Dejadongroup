import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSameOrigin, adminCookieOptions } from "@/lib/admin-auth";
import { ContentError } from "@/lib/content-api";
import { clientSessionSeconds, getClientForSession } from "@/lib/client-store";
import { consumeAttempt } from "@/lib/attempt-limiter";
import { readLimitedBody } from "@/lib/request-body";

export const clientCookieName = "dejadon-client";
export const currentClientToken = async () => (await cookies()).get(clientCookieName)?.value;
export const getCurrentClient = async () => getClientForSession(await currentClientToken());

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
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const attempt = consumeAttempt(attempts, key, 15, 15 * 60 * 1000);
  if (!attempt.allowed) return NextResponse.json({ error: "Too many attempts. Please try again in 15 minutes." }, { status: 429 });
  return null;
}
