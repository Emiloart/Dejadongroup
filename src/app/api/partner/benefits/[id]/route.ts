import { contentApiError } from "@/lib/content-api";
import { currentPartnerToken, partnerJson } from "@/lib/partner-api";
import { getPartnerBenefit } from "@/lib/partner-store";

export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try { return partnerJson({ benefit: await getPartnerBenefit(currentPartnerToken() || "", params.id) }); }
  catch (error) { return contentApiError(error); }
}
