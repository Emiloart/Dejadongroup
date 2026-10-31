import { NextResponse } from "next/server";
import { adminOperation, requireAdmin, inScope, can } from "@/lib/admin-access";
import type { Permission } from "@/lib/admin-permissions";
import { contentApiError, readContentBody } from "@/lib/content-api";
import { savingsAccounts, savingsConfiguration, saveSavingsPlan, saveFoodOffer, requestSavingsEnrollment, changeSavingsEnrollment, updateSavingsFulfillment, savingsTotals, contributionSchedule, availableSavingsOptions } from "@/lib/savings-store";
import { getPublishedProducts } from "@/lib/marketplace-store";
import { readCollection } from "@/lib/site-storage";
import { financeOperations } from "@/lib/finance-store";
import { serviceAssignments } from "@/lib/client-services";
import { AdminError } from "@/lib/admin-store";
import type { ClientDetails } from "@/lib/client-types";
import type { FinanceLedgerEntry } from "@/lib/savings-types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data: unknown) => NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
export async function GET() {
  try {
    const admin = await requireAdmin("savings.read"); const ledger = await readCollection<FinanceLedgerEntry>("finance-ledger");
    const clients = (await readCollection<ClientDetails>("clients")).filter((client) => inScope(admin, "clients", client.id)).map(({ id, fullName }) => ({ id, fullName }));
    return json({ config: await savingsConfiguration(), products: (await getPublishedProducts()).filter((product) => product.category === "food-packages"), clients, assignments: (await serviceAssignments()).filter((item) => inScope(admin, "clients", item.clientId)), accounts: (await savingsAccounts()).filter((item) => inScope(admin, "clients", item.clientId)).map((account) => ({ account, totals: savingsTotals(account, ledger), schedule: contributionSchedule(account, ledger) })), withdrawals: can(admin, "savings.withdrawals.review") ? (await financeOperations()).filter((item) => item.kind === "savings-withdrawal" && inScope(admin, "clients", item.clientId)) : [], options: { flexisave: await availableSavingsOptions("flexisave"), food_package_savings: await availableSavingsOptions("food_package_savings") } });
  } catch (error) { return contentApiError(error); }
}
export async function POST(request: Request) {
  try {
    const input = await readContentBody(request); let permission: Permission;
    if (input.operation === "plan") permission = "savings.plans.manage";
    else if (input.operation === "offer") permission = "savings.offers.manage";
    else if (input.operation === "enroll") permission = "savings.enrollments.manage";
    else if (input.operation === "fulfillment") permission = "savings.fulfillment.manage";
    else if (input.operation === "enrollment") permission = ["activate", "suspend", "resume"].includes(String(input.action)) ? "savings.accounts.activate" : input.action === "pending" ? "savings.enrollments.manage" : "savings.enrollments.review";
    else throw new AdminError("Unknown savings operation.", 404);
    return json(await adminOperation(request, permission, async (admin) => {
      if (input.operation === "plan") return saveSavingsPlan(admin, input);
      if (input.operation === "offer") return saveFoodOffer(admin, input);
      if (input.operation === "fulfillment") return updateSavingsFulfillment(admin, input);
      if (input.operation === "enrollment") return changeSavingsEnrollment(admin, input);
      if (input.service !== "flexisave" && input.service !== "food_package_savings") throw new AdminError("Choose a savings service.");
      return requestSavingsEnrollment(String(input.clientId || ""), input.service, input, admin);
    }));
  } catch (error) { return contentApiError(error); }
}
