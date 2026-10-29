import { can, type AdminPrincipal } from "@/lib/admin-permissions";
import { scopedClients } from "@/lib/admin-client-service";
import { scopedProgramme } from "@/lib/admin-partner-service";
import { financeView, financeOperations } from "@/lib/finance-store";
import { auditHistory } from "@/lib/admin-audit";
export async function adminNotifications(admin: AdminPrincipal) {
  const alerts: { title: string; count: number; href: string }[] = [];
  if (can(admin, "partners.read")) { const data = await scopedProgramme(admin); alerts.push({ title: "Partner registrations awaiting verification or completion", count: data.partners.filter((partner) => !partner.emailVerifiedAt || !partner.profileCompletedAt || !partner.registeredAt).length, href: "/admin/partners" }); }
  if (can(admin, "finance.transactions.read")) { const data = await financeView(admin); alerts.push({ title: "Refunds requiring attention", count: data.payments.filter((payment) => ["failed", "uncertain", "needs-attention"].includes(payment.refundStatus)).length, href: "/admin/finance" }, { title: "Financial operations awaiting review", count: data.operations.filter((operation) => operation.state === "review").length, href: "/admin/finance" }, { title: "Payment verification exceptions", count: data.payments.filter((payment) => ["failed", "rejected"].includes(payment.status)).length, href: "/admin/finance" }); }
  if (can(admin, "agro.withdrawals.review")) { const clients = await scopedClients(admin); const operations = await financeOperations(); alerts.push({ title: "Client withdrawal requests awaiting initial review", count: clients.reduce((sum, client) => sum + client.withdrawals.filter((withdrawal) => withdrawal.status === "pending" && !operations.some((operation) => operation.clientId === client.id && operation.withdrawalId === withdrawal.id)).length, 0), href: "/admin/client-records" }); }
  if (can(admin, "audit.read")) alerts.push({ title: "Denied privileged operations in the past 24 hours", count: (await auditHistory()).filter((event) => event.outcome === "denied" && Date.parse(event.at) > Date.now() - 86400000).length, href: "/admin/audit" });
  return alerts.filter((alert) => alert.count > 0);
}
