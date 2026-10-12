import type { DashboardRole } from "@/types/site";

export type DashboardFeature = {
  title: string;
  description: string;
  href?: string;
  action?: string;
};

export type DashboardSection = {
  label: string;
  description: string;
  items: DashboardFeature[];
};

export type DashboardHighlight = {
  label: string;
  detail: string;
  href?: string;
};

export const dashboardSections: Record<DashboardRole, DashboardSection[]> = {
  partner: [
    {
      label: "Grow your network",
      description: "Everything you need to introduce new clients and follow your referrals.",
      items: [
        { title: "Referral tools", description: "Create your personal link, copy it, and download its QR code from your profile.", href: "/dashboard/partner/profile#referral-link", action: "Open referral tools" },
        { title: "Network", description: "Your direct referrals and team activity will appear here when account services are connected." },
        { title: "Partner tier", description: "Your membership level and progress will appear once your partner record is connected." }
      ]
    },
    {
      label: "Finances",
      description: "A clear place for commission, wallet, and withdrawal records.",
      items: [
        { title: "Earnings", description: "Verified commissions from paying clients will appear here." },
        { title: "Wallet and withdrawals", description: "Balance and payout history will be available after account services are connected." }
      ]
    },
    {
      label: "Resources",
      description: "Keep approved products and marketing materials close at hand.",
      items: [
        { title: "Products", description: "Explore the agriculture products currently presented on the website.", href: "/businesses/agriculture/products", action: "View products" },
        { title: "Marketing materials", description: "Approved shareable resources will be added here when supplied." }
      ]
    }
  ],
  client: [
    {
      label: "Your property",
      description: "A home for your land and managed cultivation records.",
      items: [
        { title: "Land records", description: "Ownership details and documents will appear when your account is connected." },
        { title: "Managed cultivation", description: "Track the work associated with your land once farm records are available." },
        { title: "Investment plans", description: "Explore the available agro-real estate plans.", href: "/businesses/agro-real-estate/investment-plans", action: "View plans" }
      ]
    },
    {
      label: "Farm activity",
      description: "Follow progress in one place as updates become available.",
      items: [
        { title: "Farm updates", description: "Photos and current farm activity will appear when they are shared with your account." },
        { title: "Reports", description: "Progress reports and yield history will be available when issued." }
      ]
    }
  ]
};

export const dashboardLabels: Record<DashboardRole, string> = {
  partner: "Partner dashboard",
  client: "Client dashboard"
};

export const dashboardIntroductions: Record<DashboardRole, string> = {
  partner: "Keep your profile and referral tools together. Network and finance records will appear when account services are connected.",
  client: "Keep your profile close to your property and farm records. Account-specific updates will appear when services are connected."
};

export const dashboardHighlights: Record<DashboardRole, DashboardHighlight[]> = {
  partner: [
    { label: "Your profile", detail: "Review your details and photo", href: "/dashboard/partner/profile" },
    { label: "Referral tools", detail: "Create a link and QR code", href: "/dashboard/partner/profile#referral-link" },
    { label: "Account activity", detail: "Waiting for account connection" }
  ],
  client: [
    { label: "Your profile", detail: "Review your details and photo", href: "/dashboard/client/profile" },
    { label: "Land records", detail: "Waiting for account connection" },
    { label: "Farm updates", detail: "Waiting for account connection" }
  ]
};

export const validDashboardRoles = Object.keys(dashboardSections) as DashboardRole[];
