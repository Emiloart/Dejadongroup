import { currentPartnerToken, partnerJson } from "@/lib/partner-api";
import { contentApiError } from "@/lib/content-api";
import { getPartnerResources } from "@/lib/partner-resources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try { const response = partnerJson({ resources: await getPartnerResources(await currentPartnerToken()) }); response.headers.set("Vary", "Cookie"); return response; }
  catch (error) { const response = contentApiError(error); response.headers.set("Cache-Control", "private, no-store"); response.headers.set("Vary", "Cookie"); return response; }
}
