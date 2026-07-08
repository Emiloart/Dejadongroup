import { ContentSlot } from "@/components/content-slot";
import { ImageCanvas } from "@/components/image-canvas";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { ButtonLink } from "@/components/button-link";
import { partnerProgramSections } from "@/lib/site-data";

export default function PartnerProgramPage() {
  return (
    <SiteLayout>
      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1fr]">
          <div>
            <SectionHeader title="Partner Program" />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/login">Login</ButtonLink>
              <ButtonLink href="/login" variant="outline">
                Register
              </ButtonLink>
            </div>
          </div>
          <ImageCanvas label="Partner Program Image Canvas" />
        </div>
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerProgramSections.map((section) => (
            <section key={section} className="rounded-card border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink">{section}</h2>
              <div className="mt-5">
                <ContentSlot label={`${section} Section Slot`} />
              </div>
            </section>
          ))}
        </div>
      </PageSection>
    </SiteLayout>
  );
}
