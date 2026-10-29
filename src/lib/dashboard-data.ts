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
    { label: "Property", description: "Your verified property location and reference.", items: [] },
    { label: "Investment Plan", description: "Your plan and recorded progress.", items: [] },
    { label: "Processes", description: "Track the steps managed by De Jadon Group.", items: [] },
    { label: "Actual Date", description: "The date and label supplied for your account.", items: [] },
    { label: "Balance", description: "Your recorded balance.", items: [] },
    { label: "Withdrawal Requests", description: "Pending, Processing and Successful requests.", items: [] }
  ]
};

export const dashboardLabels: Record<DashboardRole, string> = {
  partner: "Partner dashboard",
  client: "Client dashboard"
};

export const dashboardIntroductions: Record<DashboardRole, string> = {
  partner: "Keep your profile and referral tools together. Network and finance records will appear when account services are connected.",
  client: "View your verified property, investment progress, processes, date, balance and withdrawal records."
};

export const dashboardHighlights: Record<DashboardRole, DashboardHighlight[]> = {
  partner: [
    { label: "Your profile", detail: "Review your details and photo", href: "/dashboard/partner/profile" },
    { label: "Referral tools", detail: "Create a link and QR code", href: "/dashboard/partner/profile#referral-link" },
    { label: "Account activity", detail: "Waiting for account connection" }
  ],
  client: [
    { label: "Your profile", detail: "Manage your contact details and password", href: "/dashboard/client/profile" },
    { label: "Property", detail: "View your property location", href: "/dashboard/client#property" },
    { label: "Withdrawal Requests", detail: "Track your request statuses", href: "/dashboard/client#withdrawal-requests" }
  ]
};

export const validDashboardRoles = Object.keys(dashboardSections) as DashboardRole[];
