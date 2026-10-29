import { NextResponse } from "next/server";
import { contentApiError, requireContentAdmin } from "@/lib/content-api";
import { readClientBody } from "@/lib/client-auth";
import { adminClientToken } from "@/lib/admin-client-service";
import { adminOperation } from "@/lib/admin-access";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const denied = await requireContentAdmin(request, true);
  if (denied) return denied;
  try {
    const input = await readClientBody(request);
    if (input.action !== "issue" && input.action !== "revoke") return NextResponse.json({ error: "Choose issue or revoke." }, { status: 400 });
    return NextResponse.json(await adminOperation(request, "agro.clients.activate", () => adminClientToken(params.id, input.action === "revoke"), { kind: "clients", id: params.id }), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return contentApiError(error); }
}
