import { replyToSupportTicket, getCustomerSupportTicket } from "@/lib/support-store";
import { getSupportOwner, readSupportBody, supportApiError, supportJson, supportWriteGuard, withCurrentSupportOwner } from "@/lib/support-api";
import { ContentError } from "@/lib/content-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ role: string; ticketId: string }> };

export async function GET(_request: Request, { params: paramsPromise }: Context) {
  try {
    const { role, ticketId } = await paramsPromise;
    const owner = await getSupportOwner(role);
    if (!owner) throw new ContentError("Sign in to your dashboard to view this support request.", 401);
    return supportJson({ ticket: await withCurrentSupportOwner(role, owner.id, (current) => getCustomerSupportTicket(current, ticketId)) });
  } catch (error) { return supportApiError(error); }
}

export async function POST(request: Request, { params: paramsPromise }: Context) {
  try {
    const { role, ticketId } = await paramsPromise;
    const owner = await getSupportOwner(role);
    if (!owner) throw new ContentError("Sign in to your dashboard to reply.", 401);
    const denied = supportWriteGuard(request, owner);
    if (denied) return denied;
    const input = await readSupportBody(request);
    if (input.action !== "reply") throw new ContentError("Choose a valid support action.");
    const ticket = await withCurrentSupportOwner(role, owner.id, async (current) => {
      await replyToSupportTicket(current, ticketId, input.message);
      return getCustomerSupportTicket(current, ticketId);
    });
    return supportJson({ ticket });
  } catch (error) { return supportApiError(error); }
}
