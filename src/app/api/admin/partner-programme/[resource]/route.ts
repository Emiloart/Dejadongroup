import { contentApiError } from "@/lib/content-api";
import { partnerJson, readPartnerBody, requireProgrammeSuperAdmin } from "@/lib/partner-api";
import { getAdminPartnerProgramme, savePartnerPromo, savePartnerTier } from "@/lib/partner-store";
import { confirmPartnerPayment, processPartnerRefund } from "@/lib/partner-payments";
import { serviceConfiguration } from "@/lib/partner-services";
import { textField } from "@/lib/partner-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: { resource: string } };
export async function GET(request: Request, { params }: Context) {
  const denied = requireProgrammeSuperAdmin(request); if (denied) return denied;
  if (params.resource !== "overview") return partnerJson({ error: "Not found." }, 404);
  try { return partnerJson({ ...await getAdminPartnerProgramme(), services: serviceConfiguration() }); }
  catch (error) { return contentApiError(error); }
}
export async function POST(request: Request, { params }: Context) {
  const denied = requireProgrammeSuperAdmin(request, true); if (denied) return denied;
  try {
    const input = await readPartnerBody(request, true);
    const id = textField(input.id, "record ID", 80) || undefined;
    if (params.resource === "tiers") return partnerJson({ tier: await savePartnerTier(input, id) }, id ? 200 : 201);
    if (params.resource === "promos") return partnerJson({ promo: await savePartnerPromo(input, id) }, id ? 200 : 201);
    if (params.resource === "payments") {
      const reference = textField(input.reference, "payment reference", 80, true);
      if (input.action !== "verify" && input.action !== "retry-refund") return partnerJson({ error: "Choose verify or retry-refund." }, 400);
      const payment = await confirmPartnerPayment(reference);
      if (!payment) return partnerJson({ error: "Payment not found." }, 404);
      if (input.action === "retry-refund") await processPartnerRefund(reference, true);
      return partnerJson({ ...await getAdminPartnerProgramme(), services: serviceConfiguration() });
    }
    return partnerJson({ error: "Not found." }, 404);
  } catch (error) { return contentApiError(error); }
}
