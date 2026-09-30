import type { Business, DashboardRole, DashboardSection, HeroSlide, NavItem } from "@/types/site";

export const mainNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Businesses", href: "/businesses" },
  { label: "Partner Program", href: "/partner-program" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" }
];

export const agricultureProducts = ["Fish Heads", "Cutlets", "Fish Tail"];

export const agricultureProductDetails = [
  { name: "Fish Heads", description: "", packaging: "" },
  { name: "Cutlets", description: "", packaging: "" },
  { name: "Fish Tail", description: "", packaging: "" }
];

export const agricultureFaqs = [
  { question: "Where is the land located?", answer: "The land is located at City of Kings Estate Achalla and at Alaoma Agro Estate Nawgu, Dunukofia L.G.A." },
  { question: "Is the road to the land motorable?", answer: "Yes, it is slightly motorable." },
  { question: "Can I pay in installments?", answer: "Yes, we have up to six months installmental payment plan." },
  { question: "How can one know that we are genuine?", answer: "We are a registered company." },
  { question: "When did your company start?", answer: "The company started in October 2024." },
  { question: "Where is the office located?", answer: "Our office is located at Ebube Dike Shopping Mall, Umuodu Road, Nodu Okpuno, Awka." },
  { question: "Is the property genuine?", answer: "Yes, it is 100% genuine." }
];

export const agroRealEstateFaqs = [
  { question: "Is there access road to the land?", answer: "Yes, there is access to the land." },
  { question: "Is the land in a swampy area?", answer: "No, it is a dry table land." },
  { question: "Who manages the plantation?", answer: "The company manages the plantation for the customers." },
  { question: "What documents does the company give?", answer: "The company gives two documents: Deed of Assignment and Registered Survey Plan." },
  { question: "What is the expected annual cashflow from the land?", answer: "The expected annual cashflow from the land is five hundred thousand naira minimum yearly." },
  { question: "Can I build on the land?", answer: "No, you cannot build on the land currently." },
  { question: "Can I plant any other thing on the land other than palm?", answer: "No, you cannot plant any other crop on the land." }
];

export const agroRealEstateServices = [
  { name: "Agricultural Land Sales", description: "The sales of land for agricultural purposes and investment opportunities.", audience: "Individuals who are interested in agriculture." },
  { name: "Agricultural Consultancy / Advice", description: "", audience: "Individuals who want to venture into agriculture and are not really clear on what they want to venture into." },
  { name: "Farm Development", description: "", audience: "" }
];

export const agroRealEstateBuyingProcess = [
  "Customer goes for inspection.",
  "Customer fills the land subscription form with the required customer information.",
  "Customer makes payment to the company bank account.",
  "After payment is confirmed, the customer receives land allocation.",
  "The customer is handed the land documents as proof of transfer of ownership."
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

export const homeHeroSlides: HeroSlide[] = [
  {
    eyebrow: "De Jadon Group",
    title: "De Jadon Group",
    slotLabel: "De Jadon Group Intro Slot",
    canvasLabel: "De Jadon Group Hero Canvas",
    primaryLabel: "Explore Businesses",
    primaryHref: "/businesses",
    secondaryLabel: "Contact",
    secondaryHref: "/contact"
  },
  {
    eyebrow: "Agriculture",
    title: "Agriculture",
    slotLabel: "Agriculture Hero Slot",
    canvasLabel: "Agriculture Hero Canvas",
    primaryLabel: "View Agriculture",
    primaryHref: "/businesses/agriculture",
    secondaryLabel: "View Products",
    secondaryHref: "/businesses/agriculture/products",
    accent: "green"
  },
  {
    eyebrow: "Agro-Real Estate",
    title: "Agro-Real Estate",
    slotLabel: "Agro-Real Estate Hero Slot",
    canvasLabel: "Agro-Real Estate Hero Canvas",
    primaryLabel: "Investment Plans",
    primaryHref: "/businesses/agro-real-estate/investment-plans",
    secondaryLabel: "Contact",
    secondaryHref: "/contact"
  },
  {
    eyebrow: "Partner Program",
    title: "Partner Program",
    slotLabel: "Partner Program Hero Slot",
    canvasLabel: "Partner Program Hero Canvas",
    primaryLabel: "Open Partner Program",
    primaryHref: "/partner-program",
    secondaryLabel: "Login",
    secondaryHref: "/login"
  }
];

export const homeFaqSections = [
  "Agriculture FAQ",
  "Agro-Real Estate FAQ",
  "Partner Program FAQ",
  "Contact FAQ"
];

export const updateSections = [
  "Agriculture Update Slot",
  "Agro-Real Estate Update Slot",
  "Partner Program Update Slot"
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
