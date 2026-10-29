import { NextResponse } from "next/server";
import { contentApiError, readContentBody, requireContentAdmin } from "@/lib/content-api";
import { removeNewsArticle, updateNewsArticle } from "@/lib/news-store";

export const runtime = "nodejs";
type Context = { params: { id: string } };

export async function PUT(request: Request, { params }: Context) {
  const denied = requireContentAdmin(request, true);
  if (denied) return denied;
  try { return NextResponse.json({ articles: await updateNewsArticle(params.id, (await readContentBody(request)).action) }); }
  catch (error) { return contentApiError(error); }
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = requireContentAdmin(request, true);
  if (denied) return denied;
  try { await removeNewsArticle(params.id); return NextResponse.json({ ok: true }); }
  catch (error) { return contentApiError(error); }
}
