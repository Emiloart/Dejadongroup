export type AdminSectionId = "overview" | "products" | "news" | "newsletter" | "clients" | "partners" | "referrals" | "land-farms" | "content" | "settings";

export type AdminSection = {
  id: AdminSectionId;
  label: string;
  href: string;
  description: string;
};

export const adminSections: AdminSection[] = [
  { id: "overview", label: "Overview", href: "/admin", description: "Manage the marketplace and find your workspace tools." },
  { id: "products", label: "Products", href: "/admin/products", description: "Upload product photos, set prices, and publish marketplace listings." },
  { id: "news", label: "Blog & news", href: "/admin/news", description: "Publish article links with their original images and opening excerpts." },
  { id: "newsletter", label: "Newsletter", href: "/admin/newsletter", description: "Manage and export newsletter subscribers." },
  { id: "clients", label: "Clients", href: "/admin/clients", description: "Verify client records, issue activation tokens, and manage property, investments and withdrawals." },
  { id: "partners", label: "Partners", href: "/admin/partners", description: "Manage partner accounts and programme activity." },
  { id: "referrals", label: "Referrals", href: "/admin/referrals", description: "Follow referral links and attribution." },
  { id: "land-farms", label: "Land & farms", href: "/admin/land-farms", description: "Organise property and cultivation records." },
  { id: "content", label: "Content", href: "/admin/content", description: "Prepare website updates and resources." },
  { id: "settings", label: "Settings", href: "/admin/settings", description: "Configure access and workspace preferences." }
];

export const adminSubsections = adminSections.filter((section) => !["overview", "products", "news", "newsletter", "clients"].includes(section.id));
