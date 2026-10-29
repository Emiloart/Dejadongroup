import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-access";
import { AdminError } from "@/lib/admin-store";
import type { Permission } from "@/lib/admin-permissions";
import { readLimitedBody, RequestBodyTooLarge } from "@/lib/request-body";

export class ContentError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function requireContentAdmin(request: Request, write = false) {
  const url = new URL(request.url);
  const permission: Permission = url.pathname.includes("/clients") ? write ? url.pathname.endsWith("/token") ? "agro.clients.activate" : "agro.clients.manage" : "agro.clients.read" : url.pathname.includes("/newsletter") ? write ? "newsletter.manage" : url.searchParams.get("format") === "csv" ? "newsletter.export" : "newsletter.read" : write ? "content.update" : "content.read";
  return adminGuard(request, permission, write);
}

export async function readContentBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value: unknown = JSON.parse((await readLimitedBody(request, 16 * 1024)).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch (error) {
    throw new ContentError(error instanceof RequestBodyTooLarge ? "The form is too large." : "Check the form and try again.");
  }
}

export function contentApiError(error: unknown) {
  if (error instanceof ContentError || error instanceof AdminError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error("Website content operation failed", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json({ error: "We couldn’t save this change. Please try again." }, { status: 500 });
}
