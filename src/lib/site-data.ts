import type { Business, DashboardCard, DashboardRole, NavItem } from "@/types/site";

export const mainNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Businesses", href: "/businesses" },
  { label: "Partner Program", href: "/partner-program" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" }
];

export const agricultureProducts = [
  "Live Fish",
  "Dried/Packaged Fish",
  "Palm",
  "Pepper",
  "Other Farm Harvests"
];

export const partnerProgramSections = [
  "Overview",
  "Benefits",
  "Partner Tiers",
  "Compensation",
  "FAQs",
  "Register",
  "Login"
];

export const businesses: Business[] = [
  {
    slug: "agriculture",
    name: "Agriculture",
    href: "/businesses/agriculture",
    accent: "green",
    imageCanvas: "Agriculture Image Canvas",
    sections: [
      { name: "Overview", href: "/businesses/agriculture" },
      { name: "Crop Farming", href: "/businesses/agriculture/crop-farming" },
      {
        name: "Livestock",
        href: "/businesses/agriculture/livestock",
        sections: [
          { name: "Poultry", href: "/businesses/agriculture/livestock/poultry" },
          { name: "Fishery", href: "/businesses/agriculture/livestock/fishery" },
          { name: "BSF (Black Soldier Fly)", href: "/businesses/agriculture/livestock/bsf" }
        ]
      },
      { name: "Products", href: "/businesses/agriculture/products" },
      { name: "Gallery", href: "/businesses/agriculture/gallery" }
    ]
  },
  {
    slug: "agro-real-estate",
    name: "Agro-Real Estate",
    href: "/businesses/agro-real-estate",
    accent: "orange",
    imageCanvas: "Agro-Real Estate Image Canvas",
    sections: [
      { name: "Overview", href: "/businesses/agro-real-estate" },
      {
        name: "Buy Cultivated Farmland",
        href: "/businesses/agro-real-estate/buy-cultivated-farmland"
      },
      {
        name: "Buy Land & Managed Cultivation",
        href: "/businesses/agro-real-estate/managed-cultivation"
      },
      { name: "Investment Plans", href: "/businesses/agro-real-estate/investment-plans" },
      { name: "FAQs", href: "/businesses/agro-real-estate/faqs" },
      { name: "Gallery", href: "/businesses/agro-real-estate/gallery" }
    ]
  }
];

export const dashboardCards: Record<DashboardRole, DashboardCard[]> = {
  partner: [
    { title: "Profile" },
    { title: "Partner ID" },
    { title: "Partner Tier" },
    { title: "Referral Link" },
    { title: "QR Code Canvas", canvas: true },
    { title: "Referral Tree", canvas: true },
    { title: "Team" },
    { title: "Earnings" },
    { title: "Wallet" },
    { title: "Withdrawals" },
    { title: "Products" },
    { title: "Marketing Materials" },
    { title: "Notifications" },
    { title: "Settings" }
  ],
  client: [
    { title: "Profile" },
    { title: "Client ID" },
    { title: "Agro-Real Estate" },
    { title: "Land Records" },
    { title: "Managed Cultivation" },
    { title: "Investment Plans" },
    { title: "Farm Stage" },
    { title: "Photos", canvas: true },
    { title: "Reports" },
    { title: "Yield History" },
    { title: "Notifications" },
    { title: "Settings" }
  ],
  admin: [
    { title: "Businesses" },
    { title: "Agriculture Content" },
    { title: "Agro-Real Estate Content" },
    { title: "Products" },
    { title: "Investment Plans" },
    { title: "Partner Tiers" },
    { title: "Partners" },
    { title: "Clients" },
    { title: "Requests" },
    { title: "Gallery", canvas: true },
    { title: "Contact Messages" },
    { title: "Announcements" }
  ]
};

export const dashboardLabels: Record<DashboardRole, string> = {
  partner: "Partner Dashboard",
  client: "Client Dashboard",
  admin: "Admin Dashboard"
};

export const validDashboardRoles = Object.keys(dashboardCards) as DashboardRole[];

export function getBusinessBySlug(slug: string) {
  return businesses.find((business) => business.slug === slug);
}

export function getSectionByPath(path: string) {
  for (const business of businesses) {
    const directSection = business.sections.find((section) => section.href === path);

    if (directSection) {
      return { business, section: directSection };
    }

    for (const section of business.sections) {
      const childSection = section.sections?.find((child) => child.href === path);

      if (childSection) {
        return { business, section: childSection, parent: section };
      }
    }
  }

  return undefined;
}
