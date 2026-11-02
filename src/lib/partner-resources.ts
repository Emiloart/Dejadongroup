import { ContentError } from "@/lib/content-api";
import { contentAudience, managedContent, type ManagedContent } from "@/lib/managed-content";
import { assets, type Asset } from "@/lib/admin-assets";
import { getPartnerView } from "@/lib/partner-store";
import { storageTransaction } from "@/lib/site-storage";
import type { PartnerView } from "@/lib/partner-types";

export type PartnerResource = {
  id: string; title: string; summary: string; body: string; updatedAt: string;
  href: string; file: { mime: string; bytes: number; downloadUrl: string; previewUrl: string } | null;
};
function requireMembership(view: PartnerView | null) {
  if (!view) throw new ContentError("Sign in to your partner account.", 401);
  if (!view.active || !view.partner.emailVerifiedAt || !view.partner.registeredAt || !view.currentTier || view.partner.currentTierId !== view.currentTier.id) throw new ContentError("Complete verification, registration and payment before accessing partner resources.", 403);
  return view;
}
function eligible(item: ManagedContent, view: PartnerView) {
  return item.kind === "resource" && item.status === "published" && contentAudience(item) === "partners" && (!item.tierIds?.length || item.tierIds.includes(view.partner.currentTierId!));
}
function resourceAsset(item: ManagedContent, media: Asset[]) {
  return media.find((asset) => asset.id === item.assetId && !asset.archived && !asset.clientId && asset.audience === "partners");
}
function publicResource(item: ManagedContent, asset: Asset | undefined): PartnerResource {
  const downloadUrl = `/api/partner/resources/${item.id}/file`;
  return {
    id: item.id, title: item.title, summary: item.summary, body: item.body, updatedAt: item.updatedAt,
    href: item.href, file: asset ? { mime: asset.mime, bytes: asset.bytes, downloadUrl, previewUrl: `${downloadUrl}?preview=1` } : null
  };
}
/** The caller must pass the freshly authenticated server-side view, never browser data. */
export async function resourcesForPartner(view: PartnerView | null): Promise<PartnerResource[]> {
  const member = requireMembership(view);
  return storageTransaction(async () => {
    const media = await assets();
    return (await managedContent()).filter((item) => eligible(item, member))
      .flatMap((item) => {
        const asset = resourceAsset(item, media);
        // An archived/missing upload must not leave a broken or misleading download.
        if (item.assetId && !asset || !asset && !item.href) return [];
        return [publicResource(item, asset)];
      }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });
}
export async function getPartnerResources(token: string | undefined) {
  return storageTransaction(async () => resourcesForPartner(await getPartnerView(token)));
}
export async function getPartnerResourceFile(token: string | undefined, id: string) {
  return storageTransaction(async () => {
    const member = requireMembership(await getPartnerView(token));
    const resource = (await managedContent()).find((item) => item.id === id && eligible(item, member));
    const asset = resource && resourceAsset(resource, await assets());
    if (!resource || !asset) throw new ContentError("Resource not found or no longer available for your tier.", 404);
    return { resource, asset };
  });
}
