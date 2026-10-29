import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { currentAdmin, isSameOrigin } from "@/lib/admin-auth";
import { AdminError, resolveAdmin } from "@/lib/admin-store";
import { appendAudit, withAuditActor } from "@/lib/admin-audit";
import { can, inScope, type Permission, type AdminPrincipal, type ResourceScope } from "@/lib/admin-permissions";
import { storageTransaction } from "@/lib/site-storage";
export { can, inScope };
export async function requireAdmin(permission: Permission, resource?: { kind: keyof ResourceScope; id: string }) {
  const admin = await currentAdmin();
  if (!admin) throw new AdminError("Sign in to the admin workspace.", 401);
  if (!can(admin, permission) || resource && !inScope(admin, resource.kind, resource.id)) {
    await appendAudit({ actorId: admin.id, action: "access.denied", resource: resource?.kind || "permission", resourceId: resource?.id || permission, outcome: "denied" });
    throw new AdminError(resource ? "Record not found." : "You do not have permission for this action.", resource ? 404 : 403);
  }
  return admin;
}
export async function adminGuard(request: Request, permission: Permission, write = false) {
  try { await requireAdmin(permission); if (write && !isSameOrigin(request)) throw new AdminError("Refresh the page and try again.", 403); return null; }
  catch (error) { if (error instanceof AdminError) return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } }); throw error; }
}
export async function adminPage(permission: Permission) { const admin = await currentAdmin(); if (!admin) return null; if (!can(admin, permission)) notFound(); return admin; }
/** Revalidate inside the same storage transaction that persists the mutation. */
export async function adminOperation<T>(request: Request, permission: Permission, operation: (admin: AdminPrincipal) => Promise<T>, resource?: { kind: keyof ResourceScope; id: string }, recent = false, external = false) {
  if (!isSameOrigin(request)) throw new AdminError("Refresh the page and try again.", 403);
  const initial = await requireAdmin(permission, resource);
  const run = async () => {
    const token = request.headers.get("cookie")?.split(";").map((value) => value.trim()).find((value) => value.startsWith("dejadon-admin="))?.slice(14);
    const admin = token ? await resolveAdmin(token) : null;
    if (!admin || admin.id !== initial.id || !can(admin, permission) || resource && !inScope(admin, resource.kind, resource.id)) throw new AdminError("Your access changed. Sign in again.", 403);
    if (recent && Date.now() - admin.authenticatedAt > 10 * 60 * 1000) throw new AdminError("Confirm your password again before this sensitive action.", 403);
    return withAuditActor(admin.id, request.headers.get("x-request-id")?.slice(0, 100) || crypto.randomUUID(), () => operation(admin));
  };
  try { return await (external ? run() : storageTransaction(run)); }
  catch (error) { await appendAudit({ actorId: initial.id, action: "admin.operation.failed", resource: resource?.kind || "permission", resourceId: resource?.id || permission, outcome: error instanceof AdminError && error.status === 403 ? "denied" : "failed" }); throw error; }
}
