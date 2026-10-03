import type { DashboardRole, DashboardSection } from "@/types/site";

export const dashboardSections: Record<DashboardRole, DashboardSection[]> = {
  partner: [
    {
      label: "Account",
      items: [
        { title: "Profile", group: "Account", fields: ["Full Name", "Passport", "ID", "Address", "Bank Details"] },
        { title: "Partner ID", group: "Account", fields: ["Partner ID", "Referral Code"], canvas: true },
        { title: "Partner Tier", group: "Account", fields: ["Current Tier", "Tier Status"] }
      ]
    },
    {
      label: "Growth",
      items: [
        { title: "Referral Link", group: "Growth", fields: ["Referral Link", "QR Code"], canvas: true },
        { title: "Referral Tree", group: "Growth", fields: ["Direct Referrals", "Downline"], canvas: true, wide: true },
        { title: "Team", group: "Growth", fields: ["Team Members", "Team Activity"] }
      ]
    },
    {
      label: "Earnings",
      items: [
        { title: "Earnings", group: "Earnings", fields: ["Commission", "Bonuses"] },
        { title: "Wallet", group: "Earnings", fields: ["Wallet Balance", "Wallet Activity"] },
        { title: "Withdrawals", group: "Earnings", fields: ["Withdrawal Requests", "Withdrawal History"] }
      ]
    },
    {
      label: "Resources",
      items: [
        { title: "Products", group: "Resources", fields: ["Fish Heads", "Cutlets", "Fish Tail"] },
        { title: "Marketing Materials", group: "Resources", fields: ["Banner", "Flyer", "Brochure"], canvas: true },
        { title: "Notifications", group: "Resources", fields: ["Notifications"] },
        { title: "Settings", group: "Resources", fields: ["Password", "Account Preferences"] }
      ]
    }
  ],
  client: [
    {
      label: "Account",
      items: [
        { title: "Profile", group: "Account", fields: ["Full Name", "Email", "Phone", "Address"] },
        { title: "Client ID", group: "Account", fields: ["Client ID", "Account Type"] }
      ]
    },
    {
      label: "Agro-Real Estate",
      items: [
        {
          title: "Agro-Real Estate",
          group: "Agro-Real Estate",
          fields: ["Buy Cultivated Farmland", "Buy Land & Managed Cultivation"],
          wide: true
        },
        { title: "Land Records", group: "Agro-Real Estate", fields: ["Land Records", "Documents"] },
        { title: "Managed Cultivation", group: "Agro-Real Estate", fields: ["Cultivation", "Management"] },
        { title: "Investment Plans", group: "Agro-Real Estate", fields: ["Investment Plans"] }
      ]
    },
    {
      label: "Farm Updates",
      items: [
        { title: "Farm Stage", group: "Farm Updates", fields: ["Farm Stage", "Current Activity"] },
        { title: "Photos", group: "Farm Updates", fields: ["Farm Photos"], canvas: true },
        { title: "Reports", group: "Farm Updates", fields: ["Progress Reports"], wide: true },
        { title: "Yield History", group: "Farm Updates", fields: ["Yield History"] }
      ]
    },
    {
      label: "Settings",
      items: [
        { title: "Notifications", group: "Settings", fields: ["Notifications"] },
        { title: "Settings", group: "Settings", fields: ["Password", "Account Preferences"] }
      ]
    }
  ]
};

export const dashboardLabels: Record<DashboardRole, string> = {
  partner: "Partner Dashboard",
  client: "Client Dashboard"
};

export const dashboardHighlights: Record<DashboardRole, string[]> = {
  partner: ["Partner ID", "Partner Tier", "Referral Link", "Wallet"],
  client: ["Client ID", "Land Records", "Managed Cultivation", "Reports"]
};

export const validDashboardRoles = Object.keys(dashboardSections) as DashboardRole[];
