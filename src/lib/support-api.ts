import { NextResponse } from "next/server";
import { checkClientAuthRequest, getCurrentClient } from "@/lib/client-auth";
import { ContentError, contentApiError } from "@/lib/content-api";
import { consumeAttempt, type AttemptEntry } from "@/lib/attempt-limiter";
import { getCurrentPartnerView, partnerWriteGuard } from "@/lib/partner-api";
import { RequestBodyTooLarge, readLimitedBody } from "@/lib/request-body";
import { storageTransaction } from "@/lib/site-storage";
import type { SupportRole } from "@/lib/support-store";

export type SupportOwner = { role: SupportRole; id: string; name: string; email: string };

export async function getSupportOwner(role: string): Promise<SupportOwner | null> {
  if (role === "client") {
    const client = await getCurrentClient();
    return client ? { role, id: client.id, name: client.fullName, email: client.email } : null;
  }
  if (role === "partner") {
    const view = await getCurrentPartnerView();
    if (!view) return null;
    if (!view.active) throw new ContentError("Complete partner registration and payment to use dashboard support.", 403);
    return { role, id: view.partner.id, name: view.partner.fullName, email: view.partner.email };
  }
  throw new ContentError("Not found.", 404);
}

export function withCurrentSupportOwner<T>(role: string, expectedId: string, operation: (owner: SupportOwner) => Promise<T>) {
  return storageTransaction(async () => {
    const owner = await getSupportOwner(role);
    if (!owner || owner.id !== expectedId) throw new ContentError("Sign in again to continue with support.", 401);
    return operation(owner);
  });
}

const shared = globalThis as typeof globalThis & { dejadonSupportWriteAttempts?: Map<string, AttemptEntry> };
const supportAttempts = shared.dejadonSupportWriteAttempts ||= new Map<string, AttemptEntry>();

export function supportWriteGuard(request: Request, owner: SupportOwner) {
  const standard = owner.role === "client" ? checkClientAuthRequest(request) : partnerWriteGuard(request, "support", 20);
  if (standard) {
    standard.headers.set("Cache-Control", "private, no-store");
    standard.headers.set("Vary", "Cookie");
    return standard;
  }
  const attempt = consumeAttempt(supportAttempts, `${owner.role}:${owner.id}`, 10, 15 * 60 * 1000);
  if (attempt.allowed) return null;
  return NextResponse.json({ error: "Too many support updates. Please try again later." }, {
    status: 429,
    headers: { "Retry-After": String(Math.max(1, Math.ceil((attempt.reset - Date.now()) / 1000))), "Cache-Control": "private, no-store", Vary: "Cookie" }
  });
}

export async function readSupportBody(request: Request) {
  try {
    const value: unknown = JSON.parse((await readLimitedBody(request, 16 * 1024)).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch (error) {
    throw new ContentError(error instanceof RequestBodyTooLarge ? "The support message is too large." : "Check the support form and try again.", error instanceof RequestBodyTooLarge ? 413 : 400);
  }
}

export function supportJson(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}

export function supportApiError(error: unknown) {
  const response = contentApiError(error);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie");
  return response;
}
