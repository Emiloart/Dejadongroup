import { randomUUID } from "node:crypto";
import { readCollection, updateCollection } from "@/lib/site-storage";
import { can, type AdminPrincipal } from "@/lib/admin-permissions";
import { AdminError } from "@/lib/admin-store";
import { appendAudit } from "@/lib/admin-audit";
export type ManagedContent = { id: string; kind: "announcement" | "homepage" | "resource" | "promotion"; title: string; body: string; summary: string; slug: string; href: string; assetId: string; status: "draft" | "published" | "archived"; createdAt: string; updatedAt: string; updatedBy: string };
export const managedContent = () => readCollection<ManagedContent>("managed-content");
const text = (input: unknown, limit: number) => { if (typeof input !== "string" || input.length > limit) throw new AdminError("Check the content fields and their lengths."); return input.trim(); };
export async function saveManagedContent(admin: AdminPrincipal, input: Record<string, unknown>) {
  return updateCollection<ManagedContent, ManagedContent>("managed-content", async (items) => {
    const current = input.id ? items.find((item) => item.id === input.id) : undefined;
    if (input.id && !current) throw new AdminError("Content not found.", 404);
    const publicationOnly = input.action === "publish" || input.action === "unpublish";
    if (publicationOnly) {
      if (!current || !can(admin, "content.publish")) throw new AdminError("Publishing permission is required.", 403);
      const before = { ...current }; current.status = input.action === "publish" ? "published" : "draft"; current.updatedAt = new Date().toISOString(); current.updatedBy = admin.id;
      await appendAudit({ action: `content.${input.action}`, resource: "content", resourceId: current.id, before, after: current });
      return { items, result: current };
    }
    if (!can(admin, current ? "content.update" : "content.create")) throw new AdminError("Content editing permission is required.", 403);
    const kind = input.kind; const status = input.status;
    if (!["announcement", "homepage", "resource", "promotion"].includes(String(kind)) || !["draft", "published", "archived"].includes(String(status))) throw new AdminError("Choose a valid content type and status.");
    if ((status === "published" || current?.status === "published") && !can(admin, "content.publish")) throw new AdminError("A publisher must change published content.", 403);
    const title = text(input.title, 160); const body = text(input.body, 12000); const summary = text(input.summary || "", 500); const slug = text(input.slug, 100);
    if (!title || !body || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new AdminError("Enter a title, body and lowercase URL key.");
    if (items.some((item) => item.slug === slug && item.id !== current?.id)) throw new AdminError("This URL key is already used.", 409);
    const href = text(input.href || "", 1000);
    if (href && !(href.startsWith("/") && !href.startsWith("//") && !href.includes("\\") && !/[\r\n]/.test(href))) { try { if (new URL(href).protocol !== "https:") throw new Error(); } catch { throw new AdminError("Use an HTTPS link or an internal path."); } }
    const assetId = text(input.assetId || "", 100);
    if (assetId && !(await readCollection<{ id: string; archived: boolean; clientId: string | null }>("assets")).some((asset) => asset.id === assetId && !asset.archived && !asset.clientId)) throw new AdminError("Choose an available media asset.");
    const now = new Date().toISOString();
    const item: ManagedContent = { id: current?.id || randomUUID(), kind: kind as ManagedContent["kind"], title, body, summary, slug, href, assetId, status: status as ManagedContent["status"], createdAt: current?.createdAt || now, updatedAt: now, updatedBy: admin.id };
    await appendAudit({ action: current ? "content.updated" : "content.created", resource: "content", resourceId: item.id, before: current, after: item });
    return { items: current ? items.map((row) => row.id === item.id ? item : row) : [...items, item], result: item };
  });
}
