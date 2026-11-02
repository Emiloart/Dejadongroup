import { adminOperation, adminGuard, can, requireAdmin } from "@/lib/admin-access";
import { appendAudit } from "@/lib/admin-audit";
import { contentApiError } from "@/lib/content-api";
import { AdminError } from "@/lib/admin-store";
import { readSupportBody, supportJson } from "@/lib/support-api";
import { applyAdminSupportAction, getAdminSupportTicket } from "@/lib/support-store";
import type { Permission } from "@/lib/admin-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ ticketId: string }> };

export async function GET(_request: Request, { params: paramsPromise }: Context) {
  try {
    const { ticketId } = await paramsPromise;
    const admin = await requireAdmin("support.read");
    const ticket = await getAdminSupportTicket(admin, ticketId, can(admin, "support.notes.manage"));
    await appendAudit({ actorId: admin.id, action: "support.ticket.viewed", resource: "support-ticket", resourceId: ticket.reference });
    return supportJson({ ticket });
  } catch (error) {
    const response = contentApiError(error);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Cookie");
    return response;
  }
}

export async function POST(request: Request, { params: paramsPromise }: Context) {
  const denied = await adminGuard(request, "support.read", true);
  if (denied) return denied;
  try {
    const { ticketId } = await paramsPromise;
    const input = await readSupportBody(request);
    const action = input.action;
    const permission: Permission = action === "claim" ? "support.assign" : action === "resolve" ? "support.resolve" : action === "note" ? "support.notes.manage" : action === "reply" ? "support.respond" : "support.respond";
    const ticket = await adminOperation(request, permission, async (admin) => {
      if (!can(admin, "support.read")) throw new AdminError("Support queue access is required.", 403);
      await applyAdminSupportAction(admin, ticketId, action, input.message);
      return getAdminSupportTicket(admin, ticketId, can(admin, "support.notes.manage"));
    });
    return supportJson({ ticket });
  } catch (error) {
    const response = contentApiError(error);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Cookie");
    return response;
  }
}
