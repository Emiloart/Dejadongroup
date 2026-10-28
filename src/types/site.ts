export type BusinessSlug = "agriculture" | "agro-real-estate";

export type DashboardRole = "partner" | "client";

export type Accent = "orange" | "green";

export type NavItem = {
  label: string;
  href: string;
};

export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "tiktok" | "whatsapp" | "youtube";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  handle?: string;
  href: string;
};

export type BusinessSection = {
  name: string;
  href: string;
  sections?: BusinessSection[];
};

export type Business = {
  slug: BusinessSlug;
  name: string;
  href: string;
  accent: Accent;
  imageCanvas: string;
  sections: BusinessSection[];
};

export type HeroSlide = {
  description?: string;
  eyebrow: string;
  title: string;
  slotLabel: string;
  canvasLabel: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  accent?: Accent;
};

export type PromotionContent = {
  active: boolean;
  eyebrow: string;
  title: string;
  canonicalHref: string;
  shortHref: string;
  bannerSlotLabel: string;
  heroSlotLabel: string;
  heroCanvasLabel: string;
  ctaSlotLabel: string;
};

export type FoodPackageSection = {
  title: string;
  slotLabel: string;
  canvasLabel?: string;
};

export type UpdateSlot = {
  title: string;
  canvasLabel: string;
};

export type DashboardIcon =
  | "bell"
  | "building"
  | "chart"
  | "file"
  | "home"
  | "id"
  | "image"
  | "network"
  | "package"
  | "settings"
  | "user"
  | "wallet";

export type DashboardModule = {
  label: string;
  href: string;
  icon: DashboardIcon;
};

export type DashboardCard = {
  title: string;
  group: string;
  canvas?: boolean;
  fields?: string[];
  wide?: boolean;
};

export type DashboardSection = {
  label: string;
  items: DashboardCard[];
};
