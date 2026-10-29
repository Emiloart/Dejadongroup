import { NextResponse } from "next/server";
import { contentApiError, requireContentAdmin } from "@/lib/content-api";
import { readClientBody } from "@/lib/client-auth";
import { scopedClients, saveAdminClient } from "@/lib/admin-client-service";
import { adminOperation, adminGuard, requireAdmin } from "@/lib/admin-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireContentAdmin(request);
  if (denied) return denied;
  try { return NextResponse.json({ clients: await scopedClients(await requireAdmin("agro.clients.read")) }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return contentApiError(error); }
}

export async function POST(request: Request) {
  const denied = await adminGuard(request, "agro.clients.create", true);
  if (denied) return denied;
  try { return NextResponse.json({ client: await adminOperation(request, "agro.clients.create", async (admin) => saveAdminClient(admin, await readClientBody(request))) }, { status: 201 }); }
  catch (error) { return contentApiError(error); }
}
