import { NextResponse } from "next/server";
import { isAdminAuthenticated, isSameOrigin } from "@/lib/admin-auth";
import { readLimitedBody, RequestBodyTooLarge } from "@/lib/request-body";

export class ContentError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function requireContentAdmin(request: Request, write = false) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: "Sign in again to manage website content." }, { status: 401 });
  if (write && !isSameOrigin(request)) return NextResponse.json({ error: "Refresh the page and try again." }, { status: 403 });
  return null;
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
  if (error instanceof ContentError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error("Website content operation failed", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json({ error: "We couldn’t save this change. Please try again." }, { status: 500 });
}
