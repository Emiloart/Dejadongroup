import { notFound } from "next/navigation";
import { ContentSlot } from "@/components/content-slot";
import { ImageCanvas } from "@/components/image-canvas";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionGrid } from "@/components/section-grid";
import { SiteLayout } from "@/components/site-layout";
import { agricultureProducts, getBusinessBySlug, getSectionByPath } from "@/lib/site-data";

type AgricultureSectionPageProps = {
  params: {
    slug: string[];
  };
};

export function generateStaticParams() {
  return [
    { slug: ["crop-farming"] },
    { slug: ["livestock"] },
    { slug: ["livestock", "poultry"] },
    { slug: ["livestock", "fishery"] },
    { slug: ["livestock", "bsf"] },
    { slug: ["products"] },
    { slug: ["gallery"] }
  ];
}

export default function AgricultureSectionPage({ params }: AgricultureSectionPageProps) {
  const path = `/businesses/agriculture/${params.slug.join("/")}`;
  const match = getSectionByPath(path);
  const agriculture = getBusinessBySlug("agriculture");

  if (!match || !agriculture || match.business.slug !== "agriculture") {
    notFound();
  }

  const isProducts = path === "/businesses/agriculture/products";
  const isLivestock = path === "/businesses/agriculture/livestock";
  const isGallery = path === "/businesses/agriculture/gallery";
  const isCropFarming = path === "/businesses/agriculture/crop-farming";
  const isDetailOnly = !isProducts && !isLivestock && !isGallery && !isCropFarming;

  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title={match.section.name}
          eyebrow="Agriculture"
          canvasLabel={`Agriculture ${match.section.name} Image Canvas`}
          accent="green"
        >
          <ContentSlot label={`${match.section.name} Overview Slot`} accent="green" />
        </PageHero>
      </PageSection>

      {isCropFarming ? (
        <PageSection tinted>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Palm", "Pepper"].map((name) => (
              <InfoCard key={name} title={name} canvasLabel={`${name} Image Canvas`} accent="green" />
            ))}
          </div>
        </PageSection>
      ) : null}

      {isLivestock ? (
        <PageSection tinted>
          <SectionGrid sections={match.section.sections ?? []} accent="green" />
        </PageSection>
      ) : null}

      {isProducts ? (
        <PageSection tinted>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agricultureProducts.map((product) => (
              <InfoCard key={product} title={product} canvasLabel={`${product} Image Canvas`} accent="green" />
            ))}
          </div>
        </PageSection>
      ) : null}

      {isGallery ? (
        <PageSection tinted>
          <div className="grid gap-4 md:grid-cols-3">
            <ImageCanvas label="Agriculture Gallery Canvas" accent="green" compact />
            <ImageCanvas label="Agriculture Gallery Canvas" accent="green" compact />
            <ImageCanvas label="Agriculture Gallery Canvas" accent="green" compact />
          </div>
        </PageSection>
      ) : null}

      {isDetailOnly ? (
        <PageSection tinted>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title={`${match.section.name} Detail`} slotLabel={`${match.section.name} Detail Slot`} accent="green" />
            <InfoCard title={`${match.section.name} Gallery`} canvasLabel={`${match.section.name} Gallery Canvas`} accent="green" />
          </div>
        </PageSection>
      ) : null}
    </SiteLayout>
  );
}
