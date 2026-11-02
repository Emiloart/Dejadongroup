import { contentApiError } from "@/lib/content-api";
import { currentPartnerToken, partnerJson } from "@/lib/partner-api";
import { getPartnerBenefit } from "@/lib/partner-store";

export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id } = await paramsPromise;
  try { return partnerJson({ benefit: await getPartnerBenefit((await currentPartnerToken()) || "", id) }); }
  catch (error) { return contentApiError(error); }
}
