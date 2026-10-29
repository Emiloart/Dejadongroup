import { NextResponse } from "next/server";
import { contentApiError, requireContentAdmin } from "@/lib/content-api";
import { getNewsletterSubscribers } from "@/lib/newsletter-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireContentAdmin(request);
  if (denied) return denied;
  try {
    const subscribers = await getNewsletterSubscribers();
    if (new URL(request.url).searchParams.get("format") === "csv") {
      const cell = (value: string) => `"${value.replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`;
      const csv = ["Email,Subscribed at", ...subscribers.map((item) => `${cell(item.email)},${cell(item.subscribedAt)}`)].join("\r\n");
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="newsletter-subscribers.csv"', "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ subscribers }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return contentApiError(error); }
}
