import type {
  Business,
  DashboardModule,
  DashboardRole,
  FoodPackageSection,
  HeroSlide,
  NavItem,
  PromotionContent,
  SocialLink,
  UpdateSlot
} from "@/types/site";

export const mainNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Businesses", href: "/businesses" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Gallery", href: "/gallery" },
  { label: "Partner Program", href: "/partner-program" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" }
];

export const agricultureProducts = ["Fish Heads", "Cutlets", "Fish Tail", "Food Packages"];

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

export const foodPackagesHref = "/businesses/agriculture/products/food-packages";

export const foodPackagePromotion: PromotionContent = {
  active: true,
  eyebrow: "Food Packages",
  title: "Food Packages Raffle Promotion",
  canonicalHref: foodPackagesHref,
  shortHref: "/food-packages",
  bannerSlotLabel: "Food Packages Promotion Banner Content",
  heroSlotLabel: "Food Packages Promotion Hero Content",
  heroCanvasLabel: "Food Packages Promotion Hero Image Canvas",
  ctaSlotLabel: "Food Packages Raffle Promotion CTA Content"
};

export const foodPackageSections: FoodPackageSection[] = [
  { title: "Available Food Packages", slotLabel: "Available Food Packages Content", canvasLabel: "Food Packages Collection Canvas" },
  { title: "Raffle Promotion", slotLabel: "Raffle Promotion Content", canvasLabel: "Raffle Promotion Image Canvas" },
  { title: "How to Participate", slotLabel: "Raffle Participation Requirements" },
  { title: "Eligibility", slotLabel: "Raffle Eligibility Requirements" },
  { title: "Draw Information", slotLabel: "Raffle Draw Information" },
  { title: "Promotion Terms", slotLabel: "Approved Raffle Promotion Terms" },
  { title: "FAQs", slotLabel: "Food Packages and Raffle FAQs" }
];

// Add only verified official accounts. Empty or invalid links are not rendered.
export const socialLinks: SocialLink[] = [];

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
    title: "Welcome to De Jadon Group",
    description: "A Nigerian investment and wealth-creation company focused on creating practical opportunities for individuals, families, businesses and organizations to build and preserve wealth.",
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
    description: "Our agriculture business is focused on producing food, creating value, and developing sustainable opportunities from land. Our operations include crop farming, poultry farming, fish farming and maggot farming.",
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
    description: "Our agro-real estate business combines land investment and agricultural development, creating opportunities for individuals and investors to own and participate in productive agricultural assets.",
    slotLabel: "Agro-Real Estate Hero Slot",
    canvasLabel: "Agro-Real Estate Hero Canvas",
    primaryLabel: "Investment Plans",
    primaryHref: "/businesses/agro-real-estate/investment-plans",
    secondaryLabel: "Contact",
    secondaryHref: "/contact"
  },
  {
    eyebrow: "Structured savings",
    title: "Flexisave",
    description: "A structured savings solution designed to encourage disciplined financial planning and help you work towards specific financial goals.",
    slotLabel: "Flexisave Hero Slot",
    canvasLabel: "Flexisave Hero Canvas",
    primaryLabel: "Explore Flexisave",
    primaryHref: "/businesses/flexisave",
    secondaryLabel: "Talk to our team",
    secondaryHref: "/contact",
    accent: "green"
  }
];

export const homeFaqSections = [
  "Agriculture FAQ",
  "Agro-Real Estate FAQ",
  "Flexisave FAQ",
  "Partner Program FAQ",
  "Contact FAQ"
];

export const updateSections: UpdateSlot[] = [
  { title: "Agriculture Update", canvasLabel: "Agriculture Update Image Canvas" },
  { title: "Agro-Real Estate Update", canvasLabel: "Agro-Real Estate Update Image Canvas" },
  { title: "Partner Program Update", canvasLabel: "Partner Program Update Image Canvas" }
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
      {
        name: "Products",
        href: "/businesses/agriculture/products",
        sections: [{ name: "Food Packages", href: foodPackagesHref }]
      },
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
  },
  {
    slug: "flexisave",
    name: "Flexisave",
    href: "/businesses/flexisave",
    accent: "green",
    imageCanvas: "Flexisave Image Canvas",
    sections: [
      { name: "Overview", href: "/businesses/flexisave" },
      { name: "Enquire about Flexisave", href: "/contact" }
    ]
  }
];

export const dashboardModules: Record<DashboardRole, DashboardModule[]> = {
  partner: [
    { label: "Overview", href: "/dashboard/partner", icon: "home" },
    { label: "Profile", href: "/dashboard/partner/profile", icon: "user" },
    { label: "Membership", href: "/dashboard/partner/membership", icon: "id" },
    { label: "Network", href: "/dashboard/partner/network", icon: "network" },
    { label: "Finances", href: "/dashboard/partner/finances", icon: "wallet" },
    { label: "Products", href: "/dashboard/partner/products", icon: "package" },
    { label: "Marketing Materials", href: "/dashboard/partner/marketing-materials", icon: "image" },
    { label: "Notifications", href: "/dashboard/partner/notifications", icon: "bell" },
    { label: "Settings", href: "/dashboard/partner/settings", icon: "settings" }
  ],
  client: [
    { label: "Overview", href: "/dashboard/client", icon: "home" },
    { label: "Profile", href: "/dashboard/client/profile", icon: "user" },
    { label: "Property", href: "/dashboard/client#property", icon: "building" },
    { label: "Investment Plan", href: "/dashboard/client#investment-plan", icon: "file" },
    { label: "Processes", href: "/dashboard/client#processes", icon: "file" },
    { label: "Actual Date", href: "/dashboard/client#actual-date", icon: "file" },
    { label: "Balance", href: "/dashboard/client#balance", icon: "wallet" },
    { label: "Withdrawal Requests", href: "/dashboard/client#withdrawal-requests", icon: "wallet" }
  ]
};

export const dashboardLabels: Record<DashboardRole, string> = {
  partner: "Partner Dashboard",
  client: "Client Dashboard"
};

export const dashboardHighlights: Record<DashboardRole, string[]> = {
  partner: ["Partner ID", "Partner Tier", "Referral Link", "Wallet"],
  client: ["Property", "Investment Plan", "Processes", "Actual Date", "Balance", "Withdrawal Requests"]
};

export const validDashboardRoles = Object.keys(dashboardModules) as DashboardRole[];

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

// Supplied contact information. Profile URLs and WhatsApp were not supplied.
export const companyContact = {
  phone: "08070458759",
  telephoneHref: "tel:+2348070458759",
  email: "dejadongroup@gmail.com",
  office: "Shop C15 Ebube Dike Shopping Mall, Umuodu Road, Good Will Junction, Nodu, Okpuno, Awka, Anambra State.",
  workingHours: "8:30am – 5:00pm"
};
export const companyMapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyContact.office)}`;
export const companySocialProfiles = [
  { platform: "Facebook", names: "De Jadon Group · De Jadon Properties" },
  { platform: "Instagram", names: "De Jadon Group" },
  { platform: "TikTok", names: "De Jadon Group" }
];
export const founderMessage = "Discover practical knowledge, innovative farming methods and valuable insights from our experience in agriculture and agro-real estate. Explore our journey, learn from what we do, and discover new opportunities to grow with us.";
