import { notFound } from "next/navigation";
import { ContentSlot } from "@/components/content-slot";
import { ImageCanvas } from "@/components/image-canvas";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SiteLayout } from "@/components/site-layout";
import { getSectionByPath } from "@/lib/site-data";

type AgroRealEstateSectionPageProps = {
  params: {
    section: string;
  };
};

export function generateStaticParams() {
  return [
    { section: "buy-cultivated-farmland" },
    { section: "managed-cultivation" },
    { section: "investment-plans" },
    { section: "faqs" },
    { section: "gallery" }
  ];
}

export default function AgroRealEstateSectionPage({ params }: AgroRealEstateSectionPageProps) {
  const path = `/businesses/agro-real-estate/${params.section}`;
  const match = getSectionByPath(path);

  if (!match || match.business.slug !== "agro-real-estate") {
    notFound();
  }

  const isGallery = path === "/businesses/agro-real-estate/gallery";

  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title={match.section.name}
          eyebrow="Agro-Real Estate"
          canvasLabel={`Agro-Real Estate ${match.section.name} Image Canvas`}
        >
          <ContentSlot label={`${match.section.name} Overview Slot`} />
        </PageHero>
      </PageSection>
      <PageSection tinted>
        {isGallery ? (
          <div className="grid gap-4 md:grid-cols-3">
            <ImageCanvas label="Agro-Real Estate Gallery Canvas" compact />
            <ImageCanvas label="Agro-Real Estate Gallery Canvas" compact />
            <ImageCanvas label="Agro-Real Estate Gallery Canvas" compact />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title={`${match.section.name} Details`} slotLabel={`${match.section.name} Details Slot`} />
            <InfoCard title={`${match.section.name} Inquiry`} slotLabel={`${match.section.name} Inquiry Slot`} href="/contact" />
          </div>
        )}
      </PageSection>
    </SiteLayout>
  );
}
