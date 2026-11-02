import { currentPartnerToken } from "@/lib/partner-api";
import { contentApiError } from "@/lib/content-api";
import { getPartnerResourceFile } from "@/lib/partner-resources";
import { assetBytes } from "@/lib/admin-assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { asset } = await getPartnerResourceFile(await currentPartnerToken(), (await params).id);
    const preview = new URL(request.url).searchParams.get("preview") === "1" && /^(image|video)\//.test(asset.mime);
    let bytes: Buffer;
    try { bytes = await assetBytes(asset); } catch { return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } }); }
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": asset.mime, "Content-Length": String(bytes.length), "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox", "Cache-Control": "private, no-store", "Vary": "Cookie",
      "Referrer-Policy": "no-referrer", "Content-Disposition": `${preview ? "inline" : "attachment"}; filename="${asset.filename}"`
    } });
  } catch (error) { const response = contentApiError(error); response.headers.set("Cache-Control", "private, no-store"); response.headers.set("Vary", "Cookie"); return response; }
}
