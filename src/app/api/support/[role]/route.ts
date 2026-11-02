import { createSupportTicket, listCustomerSupportTickets } from "@/lib/support-store";
import { getSupportOwner, readSupportBody, supportApiError, supportJson, supportWriteGuard, withCurrentSupportOwner } from "@/lib/support-api";
import { ContentError } from "@/lib/content-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ role: string }> };

export async function GET(_request: Request, { params: paramsPromise }: Context) {
  try {
    const { role } = await paramsPromise;
    const owner = await getSupportOwner(role);
    if (!owner) throw new ContentError("Sign in to your dashboard to view support requests.", 401);
    return supportJson({ tickets: await withCurrentSupportOwner(role, owner.id, (current) => listCustomerSupportTickets(current)) });
  } catch (error) { return supportApiError(error); }
}

export async function POST(request: Request, { params: paramsPromise }: Context) {
  try {
    const { role } = await paramsPromise;
    const owner = await getSupportOwner(role);
    if (!owner) throw new ContentError("Sign in to your dashboard to contact support.", 401);
    const denied = supportWriteGuard(request, owner);
    if (denied) return denied;
    const input = await readSupportBody(request);
    const ticket = await withCurrentSupportOwner(role, owner.id, (current) => createSupportTicket(current, input));
    return supportJson({ ticket }, 201);
  } catch (error) { return supportApiError(error); }
}
