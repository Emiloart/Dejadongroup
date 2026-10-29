import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GalleryGrid } from "@/components/gallery-grid";
import { PageSection } from "@/components/page-section";
import { SiteLayout } from "@/components/site-layout";
import { galleryCategories, getGalleryImages, type GalleryCategory } from "@/lib/media-library";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: siteUrl("/gallery") },
  title: "Gallery",
  description: "Explore photographs from De Jadon Group's agriculture work and agro-real estate projects."
};

const filters: { label: string; href: string; category?: GalleryCategory }[] = [
  { label: "All photographs", href: "/gallery" },
  { label: "Agriculture", href: "/gallery?category=agriculture", category: "agriculture" },
  { label: "Agro-Real Estate", href: "/gallery?category=agro-real-estate", category: "agro-real-estate" }
];

type GalleryPageProps = { searchParams?: { category?: string } };

export default function GalleryPage({ searchParams }: GalleryPageProps) {
  const category = galleryCategories.find((item) => item === searchParams?.category);
  const images = getGalleryImages(category);

  return (
    <SiteLayout>
      <section className="border-b border-ink/10 bg-warm">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-agriculture">Gallery · Inside De Jadon Group</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">Our work in pictures</h1>
          <p className="mt-4 max-w-2xl leading-7 text-stone-600">A closer look at our agriculture work and agro-real estate projects. Explore the photographs by business to see the work behind what we do.</p>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-7 sm:px-6 sm:pb-16 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
          <nav aria-label="Gallery categories" className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const selected = category === filter.category;
              return <Link key={filter.href} href={filter.href} aria-current={selected ? "page" : undefined} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${selected ? "bg-agriculture text-white" : "bg-stone-100 text-stone-600 hover:bg-agriculture/10 hover:text-agriculture"}`}>{filter.label}</Link>;
            })}
          </nav>
          <span className="text-sm text-stone-500">{images.length} {images.length === 1 ? "photograph" : "photographs"}</span>
        </div>
        <div className="mt-7"><GalleryGrid images={images} /></div>
        </div>
      </section>
      <PageSection>
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
          <Link href="/businesses" className="group border-t border-ink/10 pt-6">
            <span className="text-xs font-semibold uppercase tracking-[0.13em] text-agriculture">Our businesses</span>
            <span className="mt-3 flex items-center justify-between gap-3 text-2xl font-semibold text-ink group-hover:text-orangeAction">Discover the work behind the pictures <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0" /></span>
            <span className="mt-3 block leading-7 text-stone-600">Learn about our agriculture operations and agro-real estate services.</span>
          </Link>
          <Link href="/marketplace" className="group border-t border-ink/10 pt-6">
            <span className="text-xs font-semibold uppercase tracking-[0.13em] text-agriculture">Marketplace</span>
            <span className="mt-3 flex items-center justify-between gap-3 text-2xl font-semibold text-ink group-hover:text-orangeAction">Looking for products? <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0" /></span>
            <span className="mt-3 block leading-7 text-stone-600">Browse products, prices and availability, then enquire directly with our team.</span>
          </Link>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
