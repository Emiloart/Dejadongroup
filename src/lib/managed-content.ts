import { randomUUID } from "node:crypto";
import { readCollection, updateCollection } from "@/lib/site-storage";
import { can, type AdminPrincipal } from "@/lib/admin-permissions";
import { AdminError } from "@/lib/admin-store";
import { appendAudit } from "@/lib/admin-audit";
import type { Asset } from "@/lib/admin-assets";

export type ContentAudience = "public" | "partners";
export type ManagedContent = {
  id: string; kind: "announcement" | "homepage" | "resource" | "promotion";
  title: string; body: string; summary: string; slug: string; href: string; assetId: string;
  /** Missing audience on existing records preserves their original public behavior. */
  audience?: ContentAudience; tierIds?: string[];
  status: "draft" | "published" | "archived"; createdAt: string; updatedAt: string; updatedBy: string;
};
export const contentAudience = (item: Pick<ManagedContent, "audience">): ContentAudience => item.audience || "public";
export const isPublishedPublicContent = (item: ManagedContent) => item.status === "published" && contentAudience(item) === "public";
export const managedContent = () => readCollection<ManagedContent>("managed-content");

const text = (input: unknown, limit: number) => {
  if (typeof input !== "string" || input.length > limit) throw new AdminError("Check the content fields and their lengths.");
  return input.trim();
};
function validatedLink(value: string, resource: boolean) {
  if (!value) return;
  if (/[\u0000-\u0020\u007f\\]/.test(value)) throw new AdminError("Use a complete HTTPS link without spaces or control characters.");
  if (!resource && value.startsWith("/") && !value.startsWith("//")) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname || url.hostname === "localhost" || url.hostname.endsWith(".localhost")) throw new Error();
  } catch { throw new AdminError(resource ? "Resource links must use HTTPS without sign-in credentials. Upload a file for protected partner downloads." : "Use an HTTPS link or an internal path."); }
}
async function validatePublication(item: ManagedContent) {
  if (!item.title || !item.body) throw new AdminError("Add a title and content before publishing.");
  validatedLink(item.href, item.kind === "resource");
  if (item.kind === "resource" && !item.assetId && !item.href) throw new AdminError("Add a downloadable file or an HTTPS resource link before publishing.");
  if (item.assetId) await availableAsset(item.assetId, contentAudience(item));
  if (item.audience === "partners" && item.kind !== "resource") throw new AdminError("Partner-only content must use the resource content type.");
  await validateTiers(item.tierIds || [], contentAudience(item));
}
async function availableAsset(id: string, audience: ContentAudience) {
  const asset = (await readCollection<Asset>("assets")).find((asset) => asset.id === id && !asset.archived && !asset.clientId);
  if (!asset || (asset.audience || "public") !== audience) throw new AdminError(`Choose an available ${audience === "partners" ? "partner-only" : "public"} media asset. Public files cannot be reused as protected partner material.`);
  return asset;
}
async function validateTiers(ids: string[], audience: ContentAudience) {
  if (audience !== "partners" && ids.length) throw new AdminError("Tier restrictions apply only to partner resources.");
  if (ids.length) {
    const programmes = await readCollection<{ tiers: { id: string }[] }>("partner-programme");
    const tiers = programmes.flatMap((programme) => programme.tiers);
    if (ids.some((id) => !tiers.some((tier) => tier.id === id))) throw new AdminError("Choose existing partner tiers.");
  }
}
export async function saveManagedContent(admin: AdminPrincipal, input: Record<string, unknown>) {
  return updateCollection<ManagedContent, ManagedContent>("managed-content", async (items) => {
    const current = input.id ? items.find((item) => item.id === input.id) : undefined;
    if (input.id && !current) throw new AdminError("Content not found.", 404);
    const publicationOnly = input.action === "publish" || input.action === "unpublish";
    if (publicationOnly) {
      if (!current || !can(admin, "content.publish")) throw new AdminError("Publishing permission is required.", 403);
      if (input.action === "publish") await validatePublication(current);
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
    const audience = input.audience === undefined ? contentAudience(current || {}) : input.audience;
    if (audience !== "public" && audience !== "partners") throw new AdminError("Choose a public or partner-only audience.");
    if (audience === "partners" && kind !== "resource") throw new AdminError("Partner-only content must use the resource content type.");
    const rawTiers = input.tierIds === undefined ? current?.tierIds || [] : input.tierIds;
    if (!Array.isArray(rawTiers) || rawTiers.length > 100 || rawTiers.some((id) => typeof id !== "string" || id.length > 100)) throw new AdminError("Choose valid partner tiers.");
    const tierIds = [...new Set(rawTiers as string[])];
    await validateTiers(tierIds, audience);
    const href = text(input.href || "", 1000); validatedLink(href, kind === "resource");
    const assetId = text(input.assetId || "", 100);
    if (assetId) await availableAsset(assetId, audience);
    const now = new Date().toISOString();
    const item: ManagedContent = { id: current?.id || randomUUID(), kind: kind as ManagedContent["kind"], title, body, summary, slug, href, assetId, audience, tierIds, status: status as ManagedContent["status"], createdAt: current?.createdAt || now, updatedAt: now, updatedBy: admin.id };
    if (item.status === "published") await validatePublication(item);
    await appendAudit({ action: current ? "content.updated" : "content.created", resource: "content", resourceId: item.id, before: current, after: item });
    return { items: current ? items.map((row) => row.id === item.id ? item : row) : [...items, item], result: item };
  });
}
