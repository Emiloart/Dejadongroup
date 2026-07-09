import { ButtonLink } from "@/components/button-link";
import { ContentSlot } from "@/components/content-slot";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionGrid } from "@/components/section-grid";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { agricultureProducts, getBusinessBySlug } from "@/lib/site-data";

export default function AgriculturePage() {
  const agriculture = getBusinessBySlug("agriculture");

  if (!agriculture) {
    return null;
  }

  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title={agriculture.name}
          eyebrow="Businesses"
          canvasLabel={agriculture.imageCanvas}
          accent="green"
          actions={
            <>
              <ButtonLink href="/businesses/agriculture/products">Products</ButtonLink>
              <ButtonLink href="/businesses/agriculture/gallery" variant="outline">
                Gallery
              </ButtonLink>
            </>
          }
        >
          <ContentSlot label="Agriculture Overview Slot" accent="green" />
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="mb-8">
          <SectionHeader title="Agriculture Sections" accent="green" />
        </div>
        <SectionGrid sections={agriculture.sections} accent="green" />
      </PageSection>
      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader title="Products" accent="green" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {agricultureProducts.map((product) => (
              <InfoCard
                key={product}
                title={product}
                canvasLabel={`${product} Image Canvas`}
                href="/businesses/agriculture/products"
                accent="green"
              />
            ))}
          </div>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
