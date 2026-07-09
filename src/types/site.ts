export type BusinessSlug = "agriculture" | "agro-real-estate";

export type DashboardRole = "partner" | "client";

export type Accent = "orange" | "green";

export type NavItem = {
  label: string;
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
