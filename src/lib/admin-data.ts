import type { Permission } from "@/lib/admin-permissions";
export const adminSections = [
  { id: "overview", label: "Overview", href: "/admin", department: "Workspace", permission: null, description: "Your authorized departments and operational activity." },
  { id: "content", label: "Media & Content", href: "/admin/content", department: "Media & Content", permission: "content.read", description: "Manage announcements, homepage updates, resources and media." },
  { id: "news", label: "Blog & news", href: "/admin/news", department: "Media & Content", permission: "content.read", description: "Import article previews with their original source images." },
  { id: "newsletter", label: "Newsletter", href: "/admin/newsletter", department: "Media & Content", permission: "newsletter.read", description: "Manage consented subscribers and authorized exports." },
  { id: "products", label: "Sales & Marketplace", href: "/admin/products", department: "Sales & Marketplace", permission: "marketplace.products.read", description: "Product listings, prices, photos and publication history." },
  { id: "partners", label: "Partner Programme", href: "/admin/partners", department: "Partner Programme", permission: "partners.read", description: "Memberships, tiers, verification and referral attribution." },
  { id: "clients", label: "Client & Agro-Real Estate", href: "/admin/clients", department: "Client & Agro-Real Estate", permission: "agro.clients.read", description: "Assigned clients, property, investments and activation." },
  { id: "client-records", label: "Client records & review", href: "/admin/client-records", department: "Client & Agro-Real Estate", permission: "agro.clients.read", description: "Documents, communications, access lifecycle and withdrawal review." },
  { id: "finance", label: "Finance & Payments", href: "/admin/finance", department: "Finance & Payments", permission: "finance.transactions.read", description: "Authoritative payments, reconciliation, approvals and manual adjustments." },
  { id: "users", label: "Administrators", href: "/admin/users", department: "Super Admin", permission: "admin.users.read", description: "Provision staff and manage department assignments and sessions." },
  { id: "audit", label: "Audit history", href: "/admin/audit", department: "Super Admin", permission: "audit.read", description: "Search administrative and financial activity." },
  { id: "settings", label: "Security & approvals", href: "/admin/settings", department: "Super Admin", permission: "admin.settings.manage", description: "Approval policy, provider readiness and privileged access." }
] satisfies { id: string; label: string; href: string; department: string; permission: Permission | null; description: string }[];
export type AdminSectionId = typeof adminSections[number]["id"];
export type AdminSection = typeof adminSections[number];
export const adminSubsections = adminSections.filter((section) => ["content", "client-records", "finance", "users", "audit", "settings"].includes(section.id));
