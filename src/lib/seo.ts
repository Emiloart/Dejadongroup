import type { Metadata } from "next";

// Set SITE_URL to the current public origin; switch it when the custom domain is ready.
export function siteOrigin(): string {
  const configured = process.env.SITE_URL?.trim() || process.env.APP_BASE_URL?.trim();
  const hostingDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const value = configured || (hostingDomain ? `https://${hostingDomain}` : "https://dejadongroup.com");
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
    !(url.protocol === "https:" || (local && url.protocol === "http:"))) {
    throw new Error("SITE_URL must be a public HTTPS origin without a path (localhost HTTP is allowed for development).");
  }
  return url.origin;
}

export function siteUrl(path: string): string {
  return new URL(path, siteOrigin()).href;
}

export function publicPageMetadata(path: string, title: string, description: string): Metadata {
  return { title: path === "/" ? { absolute: title } : title, description, alternates: { canonical: siteUrl(path) } };
}
