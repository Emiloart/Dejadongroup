import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/admin-auth";
import { contentApiError, readContentBody } from "@/lib/content-api";
import { subscribeToNewsletter } from "@/lib/newsletter-store";
import { consumeAttempt } from "@/lib/attempt-limiter";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; reset: number }>();

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Refresh the page and try again." }, { status: 403 });
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!consumeAttempt(attempts, key, 10, 15 * 60 * 1000).allowed) return NextResponse.json({ error: "Please wait a few minutes before trying again." }, { status: 429 });
  try {
    await subscribeToNewsletter(await readContentBody(request));
    return NextResponse.json({ ok: true });
  } catch (error) { return contentApiError(error); }
}
