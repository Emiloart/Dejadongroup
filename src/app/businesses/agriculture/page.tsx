import { HeroText } from "@/components/hero-text";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AgricultureStory } from "@/components/agriculture-story";
import { ContentPhoto } from "@/components/content-photo";
import type { ContentPhotoName } from "@/lib/content-media";
import { publicPageMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/button-link";
import { FaqSection } from "@/components/faq-section";
import { heroMedia } from "@/lib/hero-media";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { agricultureFaqs, agricultureProducts, getBusinessBySlug } from "@/lib/site-data";

export const metadata = publicPageMetadata("/businesses/agriculture", "Agriculture", "Discover why agriculture matters and how De Jadon Group connects crop farming, poultry, fishery and Black Soldier Fly farming with everyday food production.");

const sectionPhotos: Record<string, ContentPhotoName> = {
  "/businesses/agriculture/crop-farming": "pepperPlant",
  "/businesses/agriculture/livestock": "broiler",
  "/businesses/agriculture/products": "catfish",
  "/businesses/agriculture/gallery": "palmFruit"
};

export default function AgriculturePage() {
  const agriculture = getBusinessBySlug("agriculture");

  if (!agriculture) {
    return null;
  }

  return (
    <SiteLayout>
      <PageHero
        title={agriculture.name}
        eyebrow="Businesses"
        accent="green"
        image={heroMedia.agriculture}
        actions={
          <>
            <ButtonLink href="/businesses/agriculture/products">Products</ButtonLink>
            <ButtonLink href="/businesses/agriculture/gallery" variant="inverse">
              Gallery
            </ButtonLink>
          </>
        }
      >
        <p><HeroText>Our agriculture business brings together crop farming, poultry, fishery and Black Soldier Fly farming. We focus on productive land, practical agricultural work and the food that connects farms to everyday life.</HeroText></p>
      </PageHero>
      <PageSection tinted>
        <AgricultureStory />
      </PageSection>
      <PageSection>
        <div className="mb-10">
          <SectionHeader title="Explore agriculture" accent="green" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 lg:grid-cols-4">
          {agriculture.sections.filter((section) => section.href !== agriculture.href).map((section) => <Link key={section.href} href={section.href} className="group min-w-0 rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-agriculture">
            <ContentPhoto name={sectionPhotos[section.href]} aspectRatio={4 / 3} imageClassName="transition-transform duration-300 motion-safe:group-hover:scale-[1.03]" sizes="(min-width: 1280px) 285px, (min-width: 1024px) 23vw, 45vw" />
            <span className="mt-4 flex min-h-11 items-center justify-between gap-2 text-sm font-semibold text-ink group-hover:text-agriculture sm:text-base">{section.name}<ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" /></span>
          </Link>)}
        </div>
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-10 border-t border-ink/10 pt-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeader title="From our farms" eyebrow="Products" accent="green" />
            <div className="mt-6">
              <ButtonLink href="/marketplace" variant="outline">Browse marketplace</ButtonLink>
            </div>
          </div>
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {agricultureProducts.map((product) => (
              <InfoCard
                key={product}
                title={product}
                accent="green"
                href={`/marketplace?category=${product === "Food Packages" ? "food-packages" : "fish"}`}
              />
            ))}
          </div>
        </div>
      </PageSection>
      <FaqSection items={agricultureFaqs} accent="green" />
    </SiteLayout>
  );
}
