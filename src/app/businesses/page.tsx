import { BusinessCard } from "@/components/business-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { businesses } from "@/lib/site-data";

export default function BusinessesPage() {
  return (
    <SiteLayout>
      <PageSection>
        <PageHero title="Our businesses" eyebrow="De Jadon Group">
          <p>Explore agriculture and agro-real estate, from farm products to cultivated farmland.</p>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <SectionHeader title="Find your area of interest" />
        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {businesses.map((business) => (
            <BusinessCard key={business.slug} business={business} />
          ))}
        </div>
      </PageSection>
    </SiteLayout>
  );
}
