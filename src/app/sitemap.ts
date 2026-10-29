import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/marketplace-store";
import { siteUrl } from "@/lib/seo";

// Read the live catalogue so publishing or archiving a product updates discovery immediately.
export const dynamic = "force-dynamic";

const publicPaths = [
  "/", "/about", "/businesses", "/marketplace", "/gallery", "/partner-program", "/contact",
  "/businesses/flexisave",
  "/businesses/agriculture",
  "/businesses/agriculture/crop-farming",
  "/businesses/agriculture/livestock",
  "/businesses/agriculture/livestock/poultry",
  "/businesses/agriculture/livestock/fishery",
  "/businesses/agriculture/livestock/bsf",
  "/businesses/agriculture/products",
  "/businesses/agriculture/gallery",
  "/businesses/agro-real-estate",
  "/businesses/agro-real-estate/buy-cultivated-farmland",
  "/businesses/agro-real-estate/managed-cultivation",
  "/businesses/agro-real-estate/investment-plans",
  "/businesses/agro-real-estate/faqs",
  "/businesses/agro-real-estate/gallery"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublishedProducts();
  const paths = [...publicPaths, ...products.map((product) => `/marketplace/${encodeURIComponent(product.slug)}`)];
  return [...new Set(paths)].map((path) => ({ url: siteUrl(path) }));
}
