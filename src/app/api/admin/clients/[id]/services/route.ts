import { NextResponse } from "next/server";
import { requireAdmin, adminOperation } from "@/lib/admin-access";
import { contentApiError, readContentBody } from "@/lib/content-api";
import { manageServiceAssignment, serviceAssignments } from "@/lib/client-services";
import { readCollection } from "@/lib/site-storage";
import { AdminError } from "@/lib/admin-store";
import type { ClientDetails } from "@/lib/client-types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params: paramsPromise }: Context) {
  const params = await paramsPromise;
  try {
    await requireAdmin("clients.services.read", { kind: "clients", id: params.id });
    if (!(await readCollection<ClientDetails>("clients")).some((client) => client.id === params.id)) throw new AdminError("Client not found.", 404);
    return NextResponse.json({ assignments: await serviceAssignments(params.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return contentApiError(error); }
}
export async function POST(request: Request, { params: paramsPromise }: Context) {
  const params = await paramsPromise;
  try {
    const input = await readContentBody(request);
    return NextResponse.json(await adminOperation(request, "clients.services.manage", (admin) => manageServiceAssignment(admin, { ...input, clientId: params.id }), { kind: "clients", id: params.id }), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return contentApiError(error); }
}
