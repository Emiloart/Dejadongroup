import { NextResponse } from "next/server";
import { contentApiError, requireContentAdmin } from "@/lib/content-api";
import { removeNewsletterSubscriber } from "@/lib/newsletter-store";

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const denied = requireContentAdmin(request, true);
  if (denied) return denied;
  try { await removeNewsletterSubscriber(params.id); return NextResponse.json({ ok: true }); }
  catch (error) { return contentApiError(error); }
}
