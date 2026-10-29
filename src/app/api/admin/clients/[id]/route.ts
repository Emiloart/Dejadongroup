import { NextResponse } from "next/server";
import { contentApiError, requireContentAdmin } from "@/lib/content-api";
import { readClientBody } from "@/lib/client-auth";
import { saveClientRecord } from "@/lib/client-store";

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const denied = requireContentAdmin(request, true);
  if (denied) return denied;
  try { return NextResponse.json({ client: await saveClientRecord(await readClientBody(request), params.id) }); }
  catch (error) { return contentApiError(error); }
}
