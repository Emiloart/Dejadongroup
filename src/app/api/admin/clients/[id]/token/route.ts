import { NextResponse } from "next/server";
import { contentApiError, requireContentAdmin } from "@/lib/content-api";
import { readClientBody } from "@/lib/client-auth";
import { issueClientToken } from "@/lib/client-store";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const denied = requireContentAdmin(request, true);
  if (denied) return denied;
  try {
    const input = await readClientBody(request);
    if (input.action !== "issue" && input.action !== "revoke") return NextResponse.json({ error: "Choose issue or revoke." }, { status: 400 });
    return NextResponse.json(await issueClientToken(params.id, input.action === "revoke"), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return contentApiError(error); }
}
