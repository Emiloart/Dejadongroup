import { NextResponse } from "next/server";
import { contentApiError, readContentBody, requireContentAdmin } from "@/lib/content-api";
import { addNewsArticle, getNewsArticles } from "@/lib/news-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireContentAdmin(request);
  if (denied) return denied;
  try { return NextResponse.json({ articles: await getNewsArticles() }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return contentApiError(error); }
}

export async function POST(request: Request) {
  const denied = requireContentAdmin(request, true);
  if (denied) return denied;
  try {
    const body = await readContentBody(request);
    return NextResponse.json({ article: await addNewsArticle(body.url, body.kind || "blog") }, { status: 201 });
  } catch (error) { return contentApiError(error); }
}
