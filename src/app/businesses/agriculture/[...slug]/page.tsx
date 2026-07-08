import { notFound } from "next/navigation";
import { ImageCanvas } from "@/components/image-canvas";
import { PageSection } from "@/components/page-section";
import { SectionGrid } from "@/components/section-grid";
import { SectionHeader } from "@/components/section-header";
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

  return (
    <SiteLayout>
      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1fr]">
          <SectionHeader title={match.section.name} eyebrow="Agriculture" accent="green" />
          <ImageCanvas label={`Agriculture ${match.section.name} Image Canvas`} accent="green" />
        </div>
      </PageSection>

      {isCropFarming ? (
        <PageSection tinted>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Palm", "Pepper"].map((name) => (
              <div key={name} className="rounded-card border border-agriculture/20 bg-white p-5 text-base font-semibold text-ink">
                {name}
              </div>
            ))}
          </div>
        </PageSection>
      ) : null}

      {isLivestock ? (
        <PageSection tinted>
          <SectionGrid sections={match.section.sections ?? []} />
        </PageSection>
      ) : null}

      {isProducts ? (
        <PageSection tinted>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agricultureProducts.map((product) => (
              <div key={product} className="rounded-card border border-agriculture/20 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-ink">{product}</h2>
                <div className="mt-4">
                  <ImageCanvas label={`${product} Image Canvas`} accent="green" compact />
                </div>
              </div>
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
    </SiteLayout>
  );
}
