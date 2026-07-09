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
          <ContentSlot label="Agro-Real Estate Overview Slot" />
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
