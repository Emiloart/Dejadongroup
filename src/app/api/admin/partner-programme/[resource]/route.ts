import { contentApiError } from "@/lib/content-api";
import { partnerJson, readPartnerBody } from "@/lib/partner-api";
import { savePartnerPromo, savePartnerTier } from "@/lib/partner-store";
import { scopedProgramme, managePartner } from "@/lib/admin-partner-service";
import { confirmPartnerPayment } from "@/lib/partner-payments";
import { readProgramme } from "@/lib/partner-store";
import { serviceConfiguration } from "@/lib/partner-services";
import { adminGuard, requireAdmin, adminOperation, inScope } from "@/lib/admin-access";
import { appendAudit, audited } from "@/lib/admin-audit";
import { AdminError } from "@/lib/admin-store";
import type { Permission } from "@/lib/admin-permissions";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: { resource: string } };
export async function GET(request: Request, { params }: Context) {
  const denied = await adminGuard(request, "partners.read"); if (denied) return denied;
  if (params.resource !== "overview") return partnerJson({ error: "Not found." }, 404);
  try { return partnerJson({ ...await scopedProgramme(await requireAdmin("partners.read")), services: serviceConfiguration() }); } catch (error) { return contentApiError(error); }
}
export async function POST(request: Request, { params }: Context) {
  const permission: Permission = params.resource === "tiers" ? "partners.tiers.manage" : params.resource === "promos" ? "partners.promocodes.manage" : params.resource === "members" ? "partners.manage" : "finance.transactions.reconcile";
  const denied = await adminGuard(request, permission, true); if (denied) return denied;
  try {
    const input = await readPartnerBody(request, true);
    const result = await adminOperation(request, permission, async (admin) => {
      const id = typeof input.id === "string" ? input.id : undefined;
      if (params.resource === "tiers") return { tier: await audited("tier.saved", "tier", id || "new", () => savePartnerTier(input, id), (await readProgramme()).tiers.find((tier) => tier.id === id)) };
      if (params.resource === "promos") { if (input.confirm !== true || typeof input.reason !== "string" || input.reason.trim().length < 5) throw new AdminError("Confirm the promo change and enter a reason."); return { promo: await audited("promo.saved", "promo", id || "new", () => savePartnerPromo(input, id), (await readProgramme()).promos.find((promo) => promo.id === id), input.reason as string) }; }
      if (params.resource === "members") return { partner: await managePartner(admin, input) };
      if (params.resource === "payments") {
        if (input.action !== "verify") throw new AdminError("Use Finance approvals to request and approve an exceptional refund retry.", 403);
        const payment = (await readProgramme()).payments.find((payment) => payment.reference === input.reference && inScope(admin, "partners", payment.partnerId));
        if (!payment) throw new AdminError("Payment not found.", 404);
        const checked = await confirmPartnerPayment(payment.reference);
        await appendAudit({ action: "payment.reconciled", resource: "payment", resourceId: payment.reference, after: checked });
        return { ...await scopedProgramme(admin), services: serviceConfiguration() };
      }
      throw new AdminError("Not found.", 404);
    }, undefined, params.resource === "promos", params.resource === "payments");
    return partnerJson(result);
  } catch (error) { return contentApiError(error); }
}
