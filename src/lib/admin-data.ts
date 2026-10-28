export type AdminSectionId = "overview" | "clients" | "partners" | "referrals" | "land-farms" | "content" | "settings";

export type AdminSection = {
  id: AdminSectionId;
  label: string;
  href: string;
  description: string;
};

export const adminSections: AdminSection[] = [
  { id: "overview", label: "Overview", href: "/admin", description: "See the shape of the operations workspace." },
  { id: "clients", label: "Clients", href: "/admin/clients", description: "Review client accounts and their records." },
  { id: "partners", label: "Partners", href: "/admin/partners", description: "Manage partner accounts and programme activity." },
  { id: "referrals", label: "Referrals", href: "/admin/referrals", description: "Follow referral links and attribution." },
  { id: "land-farms", label: "Land & farms", href: "/admin/land-farms", description: "Organise property and cultivation records." },
  { id: "content", label: "Content", href: "/admin/content", description: "Prepare website updates and resources." },
  { id: "settings", label: "Settings", href: "/admin/settings", description: "Configure access and workspace preferences." }
];

export const adminSubsections = adminSections.filter((section) => section.id !== "overview");
