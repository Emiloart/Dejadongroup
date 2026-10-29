import { assets, assetBytes } from "@/lib/admin-assets";
import { managedContent } from "@/lib/managed-content";
import { currentAdmin } from "@/lib/admin-auth";
import { can, inScope } from "@/lib/admin-permissions";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const asset = (await assets()).find((item) => item.id === params.id);
  if (!asset) return new Response(null, { status: 404 });
  const publicAsset = !asset.clientId && !asset.archived && (await managedContent()).some((item) => item.status === "published" && item.assetId === asset.id);
  if (!publicAsset) { const admin = await currentAdmin(); if (!admin || !(asset.clientId ? can(admin, "agro.documents.manage") && inScope(admin, "clients", asset.clientId) : can(admin, "content.read"))) return new Response(null, { status: 404 }); }
  try { return new Response(new Uint8Array(await assetBytes(asset)), { headers: { "Content-Type": asset.mime, "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox", "Cache-Control": "private, no-store", "Content-Disposition": `${asset.clientId ? "attachment" : "inline"}; filename="${asset.filename}"` } }); } catch { return new Response(null, { status: 404 }); }
}
