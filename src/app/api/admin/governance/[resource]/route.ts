import { NextResponse } from "next/server";
import { currentAdmin, isSameOrigin, adminCookieName, adminCookieOptions } from "@/lib/admin-auth";
import { adminOperation, requireAdmin, can, inScope } from "@/lib/admin-access";
import { AdminError, readAdministration, safeAdminUser, manageAdmin, reauthenticateAdmin, mutateAdministration, changeAdminPassword, adminSessionSeconds } from "@/lib/admin-store";
import { permissions, rolePermissions, type Permission } from "@/lib/admin-permissions";
import { auditHistory, appendAudit, withAuditActor } from "@/lib/admin-audit";
import { contentApiError, readContentBody } from "@/lib/content-api";
import { scopedClients } from "@/lib/admin-client-service";
import { clientNotes, manageClientRecords } from "@/lib/admin-client-records";
import { assets, uploadAsset, archiveAsset } from "@/lib/admin-assets";
import { managedContent, saveManagedContent } from "@/lib/managed-content";
import { financeOperations, financeView, initiateFinance, actOnFinance } from "@/lib/finance-store";
import { readProgramme } from "@/lib/partner-store";
import { confirmPartnerPayment } from "@/lib/partner-payments";
import { serviceConfiguration } from "@/lib/partner-services";
import { readLimitedBody } from "@/lib/request-body";
import { scopedProgramme } from "@/lib/admin-partner-service";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: { resource: string } };
const json = (value: unknown) => NextResponse.json(value, { headers: { "Cache-Control": "no-store" } });
const readPermissions: Record<string, Permission> = { users: "admin.users.read", audit: "audit.read", finance: "finance.transactions.read", content: "content.read", "client-records": "agro.clients.read", settings: "admin.settings.manage", partners: "partners.read" };
export async function GET(request: Request, { params }: Context) {
  try {
    const permission = readPermissions[params.resource]; if (!permission) throw new AdminError("Not found.", 404);
    const admin = await requireAdmin(permission); const query = new URL(request.url).searchParams;
    const page = Math.max(1, Math.min(100000, Number(query.get("page")) || 1)); const size = 25;
    const q = (query.get("q") || "").toLowerCase();
    const paginate = <T,>(rows: T[]) => { const filtered = q ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q)) : rows; return { rows: filtered.slice((page - 1) * size, page * size), page, pages: Math.max(1, Math.ceil(filtered.length / size)), total: filtered.length }; };
    if (params.resource === "users") { const state = await readAdministration(); return json({ ...paginate(state.users.map(safeAdminUser)), rolePermissions, permissions }); }
    if (params.resource === "audit") {
      const events = (await auditHistory()).reverse().filter((event) => (!query.get("actor") || event.actorId === query.get("actor")) && (!query.get("action") || event.action.includes(query.get("action")!)) && (!query.get("resource") || event.resource === query.get("resource")) && (!query.get("from") || event.at >= query.get("from")!) && (!query.get("to") || event.at.slice(0, 10) <= query.get("to")!));
      return json(paginate(events));
    }
    if (params.resource === "content") {
      const history = (await auditHistory()).filter((event) => ["content", "media", "news", "newsletter"].includes(event.resource)).slice(-100).reverse();
      return json({ ...paginate((await managedContent()).reverse()), assets: (await assets()).filter((asset) => !asset.clientId), history });
    }
    if (params.resource === "client-records") {
      const clients = await scopedClients(admin); const ids = new Set(clients.map((client) => client.id));
      return json({ ...paginate(clients), notes: (await clientNotes()).filter((note) => ids.has(note.clientId)).slice(-200).reverse(), documents: can(admin, "agro.documents.manage") ? (await assets()).filter((asset) => asset.clientId && ids.has(asset.clientId)) : [], operations: (await financeOperations()).filter((operation) => operation.kind === "withdrawal" && ids.has(operation.clientId)), history: (await auditHistory()).filter((event) => event.resource === "client" && ids.has(event.resourceId)).slice(-100).reverse() });
    }
    if (params.resource === "partners") return json(await scopedProgramme(admin));
    if (params.resource === "finance") {
      const data = await financeView(admin);
      const status = query.get("status"); const kind = query.get("kind"); const mode = query.get("mode");
      const payments = data.payments.filter((item) => (!q || JSON.stringify(item).toLowerCase().includes(q)) && (!status || item.status === status) && (!kind || item.kind === kind) && (!mode || item.providerMode === mode) && (!query.get("from") || item.createdAt >= query.get("from")!) && (!query.get("to") || item.createdAt.slice(0,10) <= query.get("to")!));
      if (query.get("format") === "csv") {
        await requireAdmin("finance.reports.read");
        await appendAudit({ actorId: admin.id, action: "finance.report.exported", resource: "finance", resourceId: "transactions", after: { count: payments.length } });
        const cell = (value: unknown) => `"${String(value ?? "").replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`;
        const fields = ["reference", "kind", "status", "providerMode", "registrationFeeKobo", "refundableVerificationFeeKobo", "amountKobo", "receivedKobo", "refundKobo", "refundStatus", "createdAt"] as const;
        return new Response([fields.join(","), ...payments.map((payment) => fields.map((field) => cell(payment[field])).join(","))].join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="partner-transactions.csv"', "Cache-Control": "no-store" } });
      }
      const clients = can(admin, "finance.balances.manage") || can(admin, "finance.withdrawals.approve") ? await scopedClients(admin) : [];
      return json({ ...paginate(payments), operations: data.operations, entries: data.entries.filter((entry) => payments.some((payment) => payment.reference === entry.reference)), clients: clients.map((client) => ({ id: client.id, fullName: client.fullName, balance: client.balance, withdrawals: client.withdrawals })), payoutExecutionAvailable: false, commissionLedgerAvailable: false, requireSecondApproval: (await readAdministration()).requireSecondApproval, services: serviceConfiguration() });
    }
    const state = await readAdministration(); return json({ requireSecondApproval: state.requireSecondApproval, services: serviceConfiguration(), storage: "Single process with persistent disk", payoutExecutionAvailable: false });
  } catch (error) { return contentApiError(error); }
}
const reauthAttempts = new Map<string, { count: number; reset: number }>();
export async function POST(request: Request, { params }: Context) {
  try {
    if (!isSameOrigin(request)) throw new AdminError("Refresh the page and try again.", 403);
    const admin = await currentAdmin(); if (!admin) throw new AdminError("Sign in to the admin workspace.", 401);
    if (["reauthenticate", "password"].includes(params.resource)) {
      const attempt = reauthAttempts.get(admin.id) || { count: 0, reset: Date.now() + 900000 }; if (attempt.reset < Date.now()) { attempt.count = 0; attempt.reset = Date.now() + 900000; } if (++attempt.count > 5) throw new AdminError("Too many attempts. Try again in 15 minutes.", 429); reauthAttempts.set(admin.id, attempt);
      let nextToken: string | null = null;
      try { const input = await readContentBody(request); if (params.resource === "password") nextToken = await withAuditActor(admin.id, crypto.randomUUID(), () => changeAdminPassword(admin, input.password, input.newPassword)); else await reauthenticateAdmin(admin, input.password); } catch (error) { await appendAudit({ actorId: admin.id, action: "admin.reauthentication.failed", resource: "admin", resourceId: admin.id, outcome: "denied" }); throw error; }
      reauthAttempts.delete(admin.id); const response = json({ ok: true }); if (nextToken) response.cookies.set(adminCookieName, nextToken, { ...adminCookieOptions, maxAge: adminSessionSeconds }); return response;
    }
    if (params.resource === "upload") {
      const clientId = new URL(request.url).searchParams.get("clientId");
      const permission = clientId ? "agro.documents.manage" : "content.media.manage";
      await requireAdmin(permission, clientId ? { kind: "clients", id: clientId } : undefined);
      const body = await readLimitedBody(request, 21 * 1024 * 1024);
      const form = await new Request(request.url, { method: "POST", body: new Uint8Array(body), headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
      return json(await adminOperation(request, permission, async (actor) => { if (clientId && !(await scopedClients(actor)).some((client) => client.id === clientId)) throw new AdminError("Client not found.", 404); return uploadAsset(form.get("file") as File, String(form.get("title") || ""), String(form.get("folder") || ""), actor.id, clientId); }, clientId ? { kind: "clients", id: clientId } : undefined));
    }
    const permission = params.resource === "users" ? "admin.roles.manage" : params.resource === "settings" ? "admin.settings.manage" : params.resource === "content" ? "content.read" : params.resource === "media" ? "content.media.manage" : params.resource === "client-records" ? "agro.clients.read" : params.resource === "finance" ? "finance.transactions.read" : null;
    // Finance initiations by an agro reviewer have an independently checked action permission.
    if (params.resource !== "finance") { if (!permission) throw new AdminError("Not found.", 404); await requireAdmin(permission); }
    const input = await readContentBody(request);
    let actionPermission: Permission = permission || "finance.transactions.read";
    if (params.resource === "finance") {
      if (input.action === "reconcile") actionPermission = "finance.transactions.reconcile";
      else if (input.action === "initiate") actionPermission = input.kind === "withdrawal" ? "agro.withdrawals.review" : input.kind === "balance" ? "finance.balances.manage" : "finance.refunds.review";
      else { const operation = (await financeOperations()).find((operation) => operation.id === input.id); actionPermission = operation?.kind === "balance" ? "finance.balances.manage" : operation?.kind === "withdrawal" ? input.action === "execute" ? "finance.withdrawals.execute" : "finance.withdrawals.approve" : input.action === "execute" ? "finance.refunds.execute" : "finance.refunds.review"; }
    }
    const result = await adminOperation(request, actionPermission, async (actor) => {
      if (params.resource === "users") return manageAdmin(actor, input);
      if (params.resource === "content") return saveManagedContent(actor, input);
      if (params.resource === "media") return archiveAsset(String(input.id || ""));
      if (params.resource === "client-records") return manageClientRecords(actor, input);
      if (params.resource === "settings") {
        if (typeof input.requireSecondApproval !== "boolean" || input.confirm !== true || typeof input.reason !== "string" || input.reason.trim().length < 5) throw new AdminError("Confirm the policy and enter a reason.");
        return mutateAdministration(async (state) => { const before = state.requireSecondApproval; state.requireSecondApproval = input.requireSecondApproval as boolean; await appendAudit({ action: "settings.approval-policy.changed", resource: "settings", resourceId: "approval-policy", before: { requireSecondApproval: before }, after: { requireSecondApproval: state.requireSecondApproval }, reason: input.reason as string }); return { ok: true }; });
      }
      if (input.action === "initiate") return initiateFinance(actor, input);
      if (input.action === "reconcile") {
        const payment = (await readProgramme()).payments.find((payment) => payment.reference === input.reference && inScope(actor, "partners", payment.partnerId));
        if (!payment) throw new AdminError("Payment not found.", 404);
        const result = await confirmPartnerPayment(payment.reference);
        await appendAudit({ action: "finance.payment.reconciled", resource: "payment", resourceId: payment.reference, after: result }); return result;
      }
      return actOnFinance(actor, input);
    }, undefined, ["users", "settings"].includes(params.resource) || params.resource === "finance" && input.action === "execute", params.resource === "finance" && ["execute", "reconcile"].includes(String(input.action)));
    return json(result ?? { ok: true });
  } catch (error) { return contentApiError(error); }
}
