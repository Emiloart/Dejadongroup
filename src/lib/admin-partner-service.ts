import { getAdminPartnerProgramme, mutateProgramme, accountDetails } from "@/lib/partner-store";
import { can, inScope, type AdminPrincipal } from "@/lib/admin-permissions";
import { AdminError } from "@/lib/admin-store";
import { appendAudit } from "@/lib/admin-audit";
export async function scopedProgramme(admin: AdminPrincipal) {
  const data = await getAdminPartnerProgramme();
  return { ...data, tiers: can(admin, "partners.tiers.read") ? data.tiers : [], promos: can(admin, "partners.promocodes.read") ? data.promos : [], partners: can(admin, "partners.read") ? data.partners.filter((partner) => inScope(admin, "partners", partner.id)) : [], payments: can(admin, "partners.payments.read") ? data.payments.filter((payment) => inScope(admin, "partners", payment.partnerId)) : [], audit: admin.roles.includes("super_admin") ? data.audit : [] };
}
export async function managePartner(admin: AdminPrincipal, input: Record<string, unknown>) {
  const id = String(input.id || ""); if (!can(admin, "partners.manage") || !inScope(admin, "partners", id)) throw new AdminError("Partner not found.", 404);
  if (input.confirm !== true || typeof input.reason !== "string" || input.reason.trim().length < 5) throw new AdminError("Confirm the action and enter a reason.");
  return mutateProgramme(async (state) => {
    const partner = state.partners.find((item) => item.id === id); if (!partner) throw new AdminError("Partner not found.", 404);
    if (input.action !== "suspend" && input.action !== "restore") throw new AdminError("Choose suspend or restore.");
    const before = { suspendedAt: partner.suspendedAt || null };
    partner.suspendedAt = input.action === "suspend" ? new Date().toISOString() : null; partner.sessions = [];
    await appendAudit({ action: `partner.${input.action}`, resource: "partner", resourceId: id, before, after: { suspendedAt: partner.suspendedAt }, reason: input.reason as string });
    return accountDetails(partner);
  });
}
