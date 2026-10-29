import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/media/", "/api/managed-media/"],
      disallow: ["/admin", "/admin/", "/admin-activate", "/api/", "/dashboard/", "/login", "/partner-programme/payment"]
    },
    sitemap: siteUrl("/sitemap.xml")
  };
}
