import { adminOperation, adminGuard, can } from "@/lib/admin-access";
import { audited } from "@/lib/admin-audit";
import { NextResponse } from "next/server";
import { contentApiError, readContentBody, requireContentAdmin } from "@/lib/content-api";
import { addNewsArticle, getNewsArticles } from "@/lib/news-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireContentAdmin(request);
  if (denied) return denied;
  try { return NextResponse.json({ articles: await getNewsArticles() }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return contentApiError(error); }
}

export async function POST(request: Request) {
  const denied = await adminGuard(request, "content.create", true);
  if (denied) return denied;
  try {
    const body = await readContentBody(request);
    return NextResponse.json({ article: await adminOperation(request, "content.create", (admin) => audited("news.imported", "news", "new", () => addNewsArticle(body.url, body.kind || "blog", can(admin, "content.publish")))) }, { status: 201 });
  } catch (error) { return contentApiError(error); }
}
