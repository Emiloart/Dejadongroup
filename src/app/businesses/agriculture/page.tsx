import { ImageCanvas } from "@/components/image-canvas";
import { PageSection } from "@/components/page-section";
import { SectionGrid } from "@/components/section-grid";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { getBusinessBySlug } from "@/lib/site-data";

export default function AgriculturePage() {
  const agriculture = getBusinessBySlug("agriculture");

  if (!agriculture) {
    return null;
  }

  return (
    <SiteLayout>
      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1fr]">
          <SectionHeader title={agriculture.name} accent="green" />
          <ImageCanvas label={agriculture.imageCanvas} accent="green" />
        </div>
      </PageSection>
      <PageSection tinted>
        <SectionGrid sections={agriculture.sections} />
      </PageSection>
    </SiteLayout>
  );
}
