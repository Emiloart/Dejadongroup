import { NextResponse } from "next/server";
import { contentApiError, requireContentAdmin } from "@/lib/content-api";
import { readClientBody } from "@/lib/client-auth";
import { saveAdminClient } from "@/lib/admin-client-service";
import { adminOperation } from "@/lib/admin-access";

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const denied = await requireContentAdmin(request, true);
  if (denied) return denied;
  try { return NextResponse.json({ client: await adminOperation(request, "agro.clients.manage", async (admin) => saveAdminClient(admin, await readClientBody(request), params.id), { kind: "clients", id: params.id }) }); }
  catch (error) { return contentApiError(error); }
}
