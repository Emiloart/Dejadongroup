import { ImageCanvas } from "@/components/image-canvas";
import { ContentSlot } from "@/components/content-slot";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";

const aboutSlots = ["About", "Vision", "Mission"];

export default function AboutPage() {
  return (
    <SiteLayout>
      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1fr]">
          <SectionHeader title="About De Jadon Group" />
          <ImageCanvas label="About Image Canvas" />
        </div>
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-4 md:grid-cols-3">
          {aboutSlots.map((slot) => (
            <section key={slot} className="rounded-card border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">{slot}</h2>
              <div className="mt-5">
                <ContentSlot label={`${slot} Content Slot`} />
              </div>
            </section>
          ))}
        </div>
      </PageSection>
    </SiteLayout>
  );
}
