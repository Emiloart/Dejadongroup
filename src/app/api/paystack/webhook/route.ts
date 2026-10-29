import { contentApiError } from "@/lib/content-api";
import { partnerJson } from "@/lib/partner-api";
import { confirmPartnerPayment, processPartnerRefund } from "@/lib/partner-payments";
import { validPaystackSignature } from "@/lib/partner-services";
import { readLimitedBody } from "@/lib/request-body";

export const runtime = "nodejs";
export async function POST(request: Request) {
  let raw: Buffer;
  try { raw = await readLimitedBody(request, 256 * 1024); } catch { return partnerJson({ error: "Invalid event." }, 400); }
  if (!validPaystackSignature(raw, request.headers.get("x-paystack-signature"))) return partnerJson({ error: "Invalid signature." }, 401);
  try {
    const event = JSON.parse(raw.toString("utf8"));
    if (event.event === "charge.success" && typeof event.data?.reference === "string") await confirmPartnerPayment(event.data.reference);
    if (typeof event.event === "string" && event.event.startsWith("refund.") && typeof event.data?.transaction_reference === "string") await processPartnerRefund(event.data.transaction_reference);
    return partnerJson({ received: true });
  } catch (error) { return contentApiError(error); }
}
