export const permissions = [
  "admin.users.read", "admin.users.manage", "admin.roles.manage", "admin.settings.manage", "audit.read",
  "content.read", "content.create", "content.update", "content.publish", "content.media.manage", "newsletter.read", "newsletter.export", "newsletter.manage",
  "marketplace.products.read", "marketplace.products.manage", "marketplace.products.publish", "marketplace.orders.read", "marketplace.orders.manage",
  "partners.read", "partners.manage", "partners.tiers.read", "partners.tiers.manage", "partners.promocodes.read", "partners.promocodes.manage", "partners.payments.read",
  "agro.clients.read", "agro.clients.create", "agro.clients.manage", "agro.clients.activate", "agro.properties.manage", "agro.investments.manage", "agro.withdrawals.review", "agro.documents.manage",
  "finance.transactions.read", "finance.transactions.reconcile", "finance.refunds.review", "finance.refunds.execute", "finance.withdrawals.approve", "finance.withdrawals.execute", "finance.balances.manage", "finance.reports.read"
] as const;
export type Permission = typeof permissions[number];
export const rolePermissions = {
  super_admin: [...permissions],
  media_admin: ["content.read", "content.create", "content.update", "content.publish", "content.media.manage", "newsletter.read", "newsletter.export", "newsletter.manage"],
  marketplace_admin: ["marketplace.products.read", "marketplace.products.manage", "marketplace.products.publish"],
  partner_programme_admin: ["partners.read", "partners.manage", "partners.tiers.read", "partners.tiers.manage", "partners.payments.read"],
  agro_real_estate_admin: ["agro.clients.read", "agro.clients.create", "agro.clients.manage", "agro.clients.activate", "agro.properties.manage", "agro.investments.manage", "agro.withdrawals.review", "agro.documents.manage"],
  finance_admin: ["finance.transactions.read", "finance.transactions.reconcile", "finance.refunds.review", "finance.withdrawals.approve", "finance.reports.read"],
  content_editor: ["content.read", "content.create", "content.update", "content.media.manage"],
  content_publisher: ["content.read", "content.publish"]
} satisfies Record<string, Permission[]>;
export type DepartmentRole = keyof typeof rolePermissions;
export type ResourceScope = { clients: "all" | string[]; partners: "all" | string[] };
export type AdminPrincipal = { id: string; email: string; name: string; roles: DepartmentRole[]; permissions: Permission[]; scope: ResourceScope; sessionId: string; authenticatedAt: number };
export function effectivePermissions(roles: DepartmentRole[], grants: Permission[], denied: Permission[]) {
  const superAdmin = roles.includes("super_admin");
  return [...new Set(roles.flatMap((role) => rolePermissions[role] as Permission[]).concat(grants))].filter((permission) =>
    !denied.includes(permission) && (!(permission === "admin.roles.manage" || permission === "partners.promocodes.manage") || superAdmin) &&
    (!permission.startsWith("finance.") || !permission.endsWith(".execute") || superAdmin || roles.includes("finance_admin")));
}
export const can = (admin: AdminPrincipal | null, permission: Permission) => Boolean(admin?.permissions.includes(permission));
export const inScope = (admin: AdminPrincipal, kind: keyof ResourceScope, id: string) => admin.scope[kind] === "all" || admin.scope[kind].includes(id);
