import { publicPageMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/button-link";
import { FaqSection } from "@/components/faq-section";
import { heroMedia } from "@/lib/hero-media";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionGrid } from "@/components/section-grid";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { agricultureFaqs, agricultureProducts, getBusinessBySlug } from "@/lib/site-data";

export const metadata = publicPageMetadata("/businesses/agriculture", "Agriculture", "Explore De Jadon Group’s crop farming, poultry, fishery, Black Soldier Fly farming, products and frequently asked questions.");

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
        <p>We are involved in agricultural activities aimed at producing food and other agricultural products. This includes crop farming and livestock/fish farming. De Jadon Group is not just about farming; it is about connecting land ownership, investment and food supply into one business model. The services currently provided include real estate services, agricultural services, food packages and investment opportunities.</p>
      </PageHero>
      <PageSection tinted>
        <div className="mb-10">
          <SectionHeader title="Explore agriculture" accent="green" />
        </div>
        <SectionGrid sections={agriculture.sections.filter((section) => section.href !== agriculture.href)} accent="green" />
      </PageSection>
      <PageSection>
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
              />
            ))}
          </div>
        </div>
      </PageSection>
      <FaqSection items={agricultureFaqs} accent="green" />
    </SiteLayout>
  );
}
