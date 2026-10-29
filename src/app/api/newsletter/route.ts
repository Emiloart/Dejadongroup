import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/admin-auth";
import { contentApiError, readContentBody } from "@/lib/content-api";
import { subscribeToNewsletter } from "@/lib/newsletter-store";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; reset: number }>();

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Refresh the page and try again." }, { status: 403 });
  const now = Date.now();
  for (const [key, value] of attempts) if (value.reset <= now) attempts.delete(key);
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const entry = attempts.get(key) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (entry.count >= 10) return NextResponse.json({ error: "Please wait a few minutes before trying again." }, { status: 429 });
  entry.count++;
  if (attempts.size < 10000 || attempts.has(key)) attempts.set(key, entry);
  try {
    await subscribeToNewsletter(await readContentBody(request));
    return NextResponse.json({ ok: true });
  } catch (error) { return contentApiError(error); }
}
