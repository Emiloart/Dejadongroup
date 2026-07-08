import { notFound } from "next/navigation";
import { ContentSlot } from "@/components/content-slot";
import { ImageCanvas } from "@/components/image-canvas";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
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
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1fr]">
          <SectionHeader title={match.section.name} eyebrow="Agro-Real Estate" />
          <ImageCanvas label={`Agro-Real Estate ${match.section.name} Image Canvas`} />
        </div>
      </PageSection>
      <PageSection tinted>
        {isGallery ? (
          <div className="grid gap-4 md:grid-cols-3">
            <ImageCanvas label="Agro-Real Estate Gallery Canvas" compact />
            <ImageCanvas label="Agro-Real Estate Gallery Canvas" compact />
            <ImageCanvas label="Agro-Real Estate Gallery Canvas" compact />
          </div>
        ) : (
          <ContentSlot label={`${match.section.name} Section Slot`} />
        )}
      </PageSection>
    </SiteLayout>
  );
}
