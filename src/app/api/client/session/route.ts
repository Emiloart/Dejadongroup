import { NextResponse } from "next/server";
import { adminCookieOptions, isSameOrigin } from "@/lib/admin-auth";
import { checkClientAuthRequest, clientCookieName, currentClientToken, getCurrentClient, readClientBody, setClientCookie } from "@/lib/client-auth";
import { signInClient, signOutClient } from "@/lib/client-store";
import { contentApiError } from "@/lib/content-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const client = await getCurrentClient();
  return NextResponse.json(client ? { client } : { error: "Sign in to your client account." }, { status: client ? 200 : 401, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const denied = checkClientAuthRequest(request);
  if (denied) return denied;
  try {
    const result = await signInClient(await readClientBody(request));
    return setClientCookie(NextResponse.json({ client: result.client }), result.token);
  } catch (error) { return contentApiError(error); }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Refresh the page and try again." }, { status: 403 });
  try {
    await signOutClient(currentClientToken());
    const response = NextResponse.json({ ok: true });
    response.cookies.set(clientCookieName, "", { ...adminCookieOptions, maxAge: 0 });
    return response;
  } catch (error) { return contentApiError(error); }
}
