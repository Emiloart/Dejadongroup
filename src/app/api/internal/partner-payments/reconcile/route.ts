import { authorizedReconciliation, partnerJson } from "@/lib/partner-api";
import { contentApiError } from "@/lib/content-api";
import { reconcilePartnerPayments } from "@/lib/partner-payments";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  if (!authorizedReconciliation(request)) return partnerJson({ error: "Unauthorized." }, 401);
  try { return partnerJson(await reconcilePartnerPayments()); }
  catch (error) { return contentApiError(error); }
}
