import { NextResponse } from "next/server";
import { contentApiError, requireContentAdmin } from "@/lib/content-api";
import { readClientBody } from "@/lib/client-auth";
import { getAdminClients, saveClientRecord } from "@/lib/client-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireContentAdmin(request);
  if (denied) return denied;
  try { return NextResponse.json({ clients: await getAdminClients() }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return contentApiError(error); }
}

export async function POST(request: Request) {
  const denied = requireContentAdmin(request, true);
  if (denied) return denied;
  try { return NextResponse.json({ client: await saveClientRecord(await readClientBody(request)) }, { status: 201 }); }
  catch (error) { return contentApiError(error); }
}
