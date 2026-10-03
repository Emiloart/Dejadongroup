import { ButtonLink } from "@/components/button-link";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionGrid } from "@/components/section-grid";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { getBusinessBySlug } from "@/lib/site-data";

export default function AgroRealEstatePage() {
  const business = getBusinessBySlug("agro-real-estate");

  if (!business) {
    return null;
  }

  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title={business.name}
          eyebrow="Businesses"
          actions={
            <>
              <ButtonLink href="/businesses/agro-real-estate/investment-plans">Investment Plans</ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Contact
              </ButtonLink>
            </>
          }
        >
          <div className="space-y-4">
            <p>Agro Real Estate is the combination of Agriculture and real estate, where land is acquired, developed, managed or sold specifically for agricultural purposes and related investments.</p>
            <p>The business was created to make life easier by providing opportunities in real estate, agriculture, food production and investment. Our ideal customers are individuals who have interest in land ownership, agriculture and long-term investment opportunities.</p>
            <p>De Jadon Group can be explained as a simple journey of interest to choice to payment to documentation to participation to value.</p>
          </div>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="mb-10">
          <SectionHeader title="Explore agro-real estate" />
        </div>
        <SectionGrid sections={business.sections.filter((section) => section.href !== business.href)} />
      </PageSection>
    </SiteLayout>
  );
}
