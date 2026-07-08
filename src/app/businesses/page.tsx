import { BusinessCard } from "@/components/business-card";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { businesses } from "@/lib/site-data";

export default function BusinessesPage() {
  return (
    <SiteLayout>
      <PageSection>
        <SectionHeader title="Businesses" />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {businesses.map((business) => (
            <BusinessCard key={business.slug} business={business} />
          ))}
        </div>
      </PageSection>
    </SiteLayout>
  );
}
