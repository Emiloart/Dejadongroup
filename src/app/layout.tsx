import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteOrigin } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  description: "Explore De Jadon Group’s agriculture, agro-real estate, Flexisave and partner opportunities in Nigeria.",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "De Jadon Group",
    title: "De Jadon Group",
    description: "Explore De Jadon Group’s agriculture, agro-real estate, Flexisave and partner opportunities in Nigeria.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "De Jadon Group logo alongside a description of its opportunities in Nigeria." }]
  },
  twitter: {
    card: "summary_large_image",
    title: "De Jadon Group",
    description: "Explore De Jadon Group’s agriculture, agro-real estate, Flexisave and partner opportunities in Nigeria.",
    images: ["/opengraph-image.png"]
  },
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : undefined,
  title: {
    default: "De Jadon Group",
    template: "%s | De Jadon Group"
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
