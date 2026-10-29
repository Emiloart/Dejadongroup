import { adminOperation } from "@/lib/admin-access";
import { audited } from "@/lib/admin-audit";
import { NextResponse } from "next/server";
import { contentApiError, requireContentAdmin } from "@/lib/content-api";
import { removeNewsletterSubscriber } from "@/lib/newsletter-store";

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const denied = await requireContentAdmin(request, true);
  if (denied) return denied;
  try { await adminOperation(request, "newsletter.manage", () => audited("newsletter.removed", "newsletter", params.id, () => removeNewsletterSubscriber(params.id))); return NextResponse.json({ ok: true }); }
  catch (error) { return contentApiError(error); }
}
