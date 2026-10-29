import { NextResponse } from "next/server";
import { checkClientAuthRequest, currentClientToken, getCurrentClient, readClientBody, setClientCookie } from "@/lib/client-auth";
import { updateClientProfile } from "@/lib/client-store";
import { contentApiError } from "@/lib/content-api";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  if (!await getCurrentClient()) return NextResponse.json({ error: "Sign in again to update your profile." }, { status: 401 });
  const rejected = checkClientAuthRequest(request);
  if (rejected) return rejected;
  try {
    const result = await updateClientProfile(currentClientToken()!, await readClientBody(request));
    const response = NextResponse.json({ client: result.client }, { headers: { "Cache-Control": "no-store" } });
    return result.token ? setClientCookie(response, result.token) : response;
  } catch (error) { return contentApiError(error); }
}
