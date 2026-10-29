import { NextResponse } from "next/server";
import { checkClientAuthRequest, readClientBody, setClientCookie } from "@/lib/client-auth";
import { activateClient } from "@/lib/client-store";
import { contentApiError } from "@/lib/content-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = checkClientAuthRequest(request);
  if (denied) return denied;
  try {
    const result = await activateClient(await readClientBody(request));
    return setClientCookie(NextResponse.json({ client: result.client }, { status: 201 }), result.token);
  } catch (error) { return contentApiError(error); }
}
