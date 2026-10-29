import { publicPageMetadata } from "@/lib/seo";
import { BusinessCard } from "@/components/business-card";
import { ButtonLink } from "@/components/button-link";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { businesses } from "@/lib/site-data";

export const metadata = publicPageMetadata("/businesses", "Our businesses", "Explore De Jadon Group’s businesses in agriculture, agro-real estate and structured savings with Flexisave.");

export default function BusinessesPage() {
  return (
    <SiteLayout>
      <PageSection>
        <PageHero title="Our businesses" eyebrow="De Jadon Group">
          <p>Explore our work in agriculture, real estate and structured savings.</p>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <SectionHeader title="Find your area of interest" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard key={business.slug} business={business} showSections />
          ))}
        </div>
      </PageSection>
      <PageSection>
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-ink">See our work</h2>
            <p className="mt-2 text-stone-600">Browse photographs from our business areas.</p>
            <div className="mt-4"><ButtonLink href="/gallery" variant="outline">Browse gallery</ButtonLink></div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-ink">Explore products</h2>
            <p className="mt-2 text-stone-600">Find agricultural products and food packages.</p>
            <div className="mt-4"><ButtonLink href="/marketplace" variant="outline">Browse marketplace</ButtonLink></div>
          </div>
        </div>

      </PageSection>
    </SiteLayout>
  );
}
