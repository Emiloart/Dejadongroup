export const marketplaceCategories = [
  { slug: "fish", name: "Fish products" },
  { slug: "food-packages", name: "Food packages" },
  { slug: "crops", name: "Crops" },
  { slug: "livestock", name: "Poultry & livestock" },
  { slug: "other", name: "Other products" }
] as const;

export type MarketplaceCategory = (typeof marketplaceCategories)[number]["slug"];

export type MarketplaceProduct = {
  slug: string;
  name: string;
  category: MarketplaceCategory;
  summary: string;
  description?: string;
  price?: number | null;
  unit?: string;
  image?: string | null;
  imageAlt?: string;
  status?: "draft" | "published" | "archived";
  availability?: "in-stock" | "out-of-stock" | "on-request";
};

export function formatProductPrice(product: MarketplaceProduct) {
  return typeof product.price === "number"
    ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(product.price)
    : "Price on enquiry";
}

export const marketplaceProducts: MarketplaceProduct[] = [
  { slug: "fish-heads", name: "Fish Heads", category: "fish", summary: "Ask our team about current cuts, quantities and availability." },
  { slug: "cutlets", name: "Cutlets", category: "fish", summary: "Ask our team about current cuts, quantities and availability." },
  { slug: "fish-tail", name: "Fish Tail", category: "fish", summary: "Ask our team about current cuts, quantities and availability." },
  { slug: "food-packages", name: "Food Packages", category: "food-packages", summary: "Ask our team about current package options and contents." }
];

export function getMarketplaceProduct(slug: string) {
  return marketplaceProducts.find((product) => product.slug === slug);
}

export function getMarketplaceCategoryName(slug: MarketplaceCategory) {
  return marketplaceCategories.find((category) => category.slug === slug)?.name ?? "Products";
}

export function getProductInquiryHref(product: MarketplaceProduct) {
  const subject = encodeURIComponent(`${product.name} enquiry — De Jadon Group`);
  const body = encodeURIComponent(`Hello De Jadon Group,\n\nI would like to ask about ${product.name}.\n\nQuantity needed: \nLocation: \nQuestions: `);
  return `mailto:dejadongroup@gmail.com?subject=${subject}&body=${body}`;
}
