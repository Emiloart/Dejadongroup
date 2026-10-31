import { authorizedReconciliation, partnerJson } from "@/lib/partner-api";
import { contentApiError } from "@/lib/content-api";
import { reconcileSavingsPayments } from "@/lib/savings-payments";
import { reconcilePartnerPayments } from "@/lib/partner-payments";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  if (!authorizedReconciliation(request)) return partnerJson({ error: "Unauthorized." }, 401);
  try { const partners = await reconcilePartnerPayments(); const savings = await reconcileSavingsPayments(); return partnerJson({ ...partners, savings }); }
  catch (error) { return contentApiError(error); }
}
