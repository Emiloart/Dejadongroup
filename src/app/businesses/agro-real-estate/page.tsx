import { ButtonLink } from "@/components/button-link";
import { ContentSlot } from "@/components/content-slot";
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
          canvasLabel={business.imageCanvas}
          actions={
            <>
              <ButtonLink href="/businesses/agro-real-estate/investment-plans">Investment Plans</ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Contact
              </ButtonLink>
            </>
          }
        >
          <div className="max-w-3xl space-y-4 text-stone-700">
            <p className="leading-7">Agro Real Estate is the combination of Agriculture and real estate, where land is acquired, developed, managed or sold specifically for agricultural purposes and related investments.</p>
            <p className="leading-7">The business was created to make life easier by providing opportunities in real estate, agriculture, food production and investment. Our ideal customers are individuals who have interest in land ownership, agriculture and long-term investment opportunities.</p>
            <p className="leading-7">De Jadon Group can be explained as a simple journey of interest to choice to payment to documentation to participation to value.</p>
          </div>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="mb-8">
          <SectionHeader title="Agro-Real Estate Sections" />
        </div>
        <SectionGrid sections={business.sections} />
      </PageSection>
    </SiteLayout>
  );
}
