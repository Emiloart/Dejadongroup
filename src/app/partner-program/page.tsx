import { ContentSlot } from "@/components/content-slot";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SiteLayout } from "@/components/site-layout";
import { ButtonLink } from "@/components/button-link";
import { partnerProgramSections } from "@/lib/site-data";

export default function PartnerProgramPage() {
  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title="Partner Program"
          eyebrow="De Jadon Group"
          canvasLabel="Partner Program Image Canvas"
          actions={
            <>
              <ButtonLink href="/login">Login</ButtonLink>
              <ButtonLink href="/login" variant="outline">
                Register
              </ButtonLink>
            </>
          }
        >
          <ContentSlot label="Partner Program Overview Slot" />
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerProgramSections.map((section) => (
            <InfoCard key={section} title={section} slotLabel={`${section} Section Slot`} />
          ))}
        </div>
      </PageSection>
    </SiteLayout>
  );
}
