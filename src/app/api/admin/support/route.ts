import { requireAdmin } from "@/lib/admin-access";
import { appendAudit } from "@/lib/admin-audit";
import { ContentError, contentApiError } from "@/lib/content-api";
import { listAdminSupportTickets, supportStatuses, type SupportStatus } from "@/lib/support-store";
import { supportJson } from "@/lib/support-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin("support.read");
    const query = new URL(request.url).searchParams;
    const status = query.get("status") || "all";
    if (status !== "all" && !supportStatuses.includes(status as SupportStatus)) throw new ContentError("Choose a valid support status.");
    const result = await listAdminSupportTickets(admin, { status, query: query.get("q") || "" });
    await appendAudit({ actorId: admin.id, action: "support.queue.viewed", resource: "support-ticket-queue", resourceId: status, after: { count: result.tickets.length } });
    return supportJson(result);
  } catch (error) {
    const response = contentApiError(error);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Cookie");
    return response;
  }
}
