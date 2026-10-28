import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GalleryGrid } from "@/components/gallery-grid";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SiteLayout } from "@/components/site-layout";
import { galleryCategories, getGalleryImages, type GalleryCategory } from "@/lib/media-library";

export const metadata: Metadata = { title: "Gallery" };

const filters: { label: string; href: string; category?: GalleryCategory }[] = [
  { label: "All", href: "/gallery" },
  { label: "Agriculture", href: "/gallery?category=agriculture", category: "agriculture" },
  { label: "Agro-Real Estate", href: "/gallery?category=agro-real-estate", category: "agro-real-estate" }
];

type GalleryPageProps = { searchParams?: { category?: string } };

export default function GalleryPage({ searchParams }: GalleryPageProps) {
  const category = galleryCategories.find((item) => item === searchParams?.category);
  const images = getGalleryImages(category);

  return (
    <SiteLayout>
      <PageSection>
        <PageHero title="Gallery" eyebrow="De Jadon Group">
          <p>A closer look at our agriculture work and agro-real estate projects.</p>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="flex flex-wrap items-center justify-between gap-5 border-b border-ink/10 pb-6">
          <nav aria-label="Gallery categories" className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const selected = category === filter.category;
              return <Link key={filter.href} href={filter.href} aria-current={selected ? "page" : undefined} className={`rounded-card px-4 py-2.5 text-sm font-semibold transition-colors ${selected ? "bg-orangeAction text-white" : "text-stone-600 hover:bg-orangeAction/5 hover:text-orangeAction"}`}>{filter.label}</Link>;
            })}
          </nav>
          <span className="text-sm text-stone-500">{images.length} {images.length === 1 ? "image" : "images"}</span>
        </div>
        <div className="mt-10"><GalleryGrid images={images} /></div>
      </PageSection>
      <PageSection>
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
          <Link href="/businesses/agriculture" className="group border-t border-ink/10 pt-6">
            <span className="flex items-center justify-between text-xl font-semibold text-ink group-hover:text-orangeAction">Explore agriculture <ArrowUpRight aria-hidden="true" className="h-5 w-5" /></span>
            <span className="mt-3 block leading-7 text-stone-600">Discover our crops, livestock and agricultural products.</span>
          </Link>
          <Link href="/businesses/agro-real-estate" className="group border-t border-ink/10 pt-6">
            <span className="flex items-center justify-between text-xl font-semibold text-ink group-hover:text-orangeAction">Explore agro-real estate <ArrowUpRight aria-hidden="true" className="h-5 w-5" /></span>
            <span className="mt-3 block leading-7 text-stone-600">Learn about cultivated farmland and managed cultivation.</span>
          </Link>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
