import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteOrigin } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  description: "Explore De Jadon Group’s agriculture, agro-real estate, Flexisave and partner opportunities in Nigeria.",
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
