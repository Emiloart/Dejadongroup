import { ButtonLink } from "@/components/button-link";
import { ContentSlot } from "@/components/content-slot";
import { ImageCanvas } from "@/components/image-canvas";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";

const aboutSlots = ["About", "Vision", "Mission", "Why Choose Us"];

export default function AboutPage() {
  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title="About De Jadon Group"
          eyebrow="About"
          canvasLabel="About Image Canvas"
          actions={
            <>
              <ButtonLink href="/businesses">Businesses</ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Contact
              </ButtonLink>
            </>
          }
        >
          <ContentSlot label="About De Jadon Group Intro Slot" />
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {aboutSlots.map((slot) => (
            <InfoCard key={slot} title={slot} slotLabel={`${slot} Content Slot`} />
          ))}
        </div>
      </PageSection>
      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionHeader title="CEO" />
            <div className="mt-6">
              <ContentSlot label="CEO Profile Slot" />
            </div>
          </div>
          <ImageCanvas label="CEO Image Canvas" />
        </div>
      </PageSection>
    </SiteLayout>
  );
}
