import { adminOperation, can } from "@/lib/admin-access";
import { audited } from "@/lib/admin-audit";
import { AdminError } from "@/lib/admin-store";
import { getNewsArticles } from "@/lib/news-store";
import { NextResponse } from "next/server";
import { contentApiError, readContentBody, requireContentAdmin } from "@/lib/content-api";
import { removeNewsArticle, updateNewsArticle } from "@/lib/news-store";

export const runtime = "nodejs";
type Context = { params: { id: string } };

export async function PUT(request: Request, { params }: Context) {
  const denied = await requireContentAdmin(request);
  if (denied) return denied;
  try { return NextResponse.json({ articles: await adminOperation(request, "content.read", async (admin) => { const action = (await readContentBody(request)).action; const current = (await getNewsArticles()).find((item) => item.id === params.id); if (!can(admin, ["publish", "hide", "up", "down"].includes(String(action)) || current?.published ? "content.publish" : "content.update")) throw new AdminError("This action requires publication or editing permission.", 403); return audited(`news.${String(action)}`, "news", params.id, () => updateNewsArticle(params.id, action), current); }) }); }
  catch (error) { return contentApiError(error); }
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = await requireContentAdmin(request);
  if (denied) return denied;
  try { await adminOperation(request, "content.update", async (admin) => { const current = (await getNewsArticles()).find((item) => item.id === params.id); if (current?.published && !can(admin, "content.publish")) throw new AdminError("Publishing permission is required.", 403); return audited("news.archived", "news", params.id, () => removeNewsArticle(params.id), current); }); return NextResponse.json({ ok: true }); }
  catch (error) { return contentApiError(error); }
}
