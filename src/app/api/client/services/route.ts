import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/client-auth";
import { serviceAssignments } from "@/lib/client-services";
import { contentApiError } from "@/lib/content-api";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const client = await getCurrentClient(); if (!client) return NextResponse.json({ error: "Sign in to your client account." }, { status: 401 });
    return NextResponse.json({ assignments: (await serviceAssignments(client.id)).map(({ id, service, status, updatedAt }) => ({ id, service, status, updatedAt })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return contentApiError(error); }
}
