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
          <div className="max-w-3xl space-y-4 text-stone-700">
            <p className="leading-7">Partner Program details are still being collected. The supplied referral rule is that when a partner refers a prospective client and that prospect becomes a paying client, the partner receives a 10% commission from the company.</p>
          </div>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerProgramSections.map((section) => (
            <InfoCard key={section} title={section}>
              {section === "Compensation" ? <p className="leading-6 text-stone-700">A partner receives a 10% commission when a referred prospect becomes a paying client.</p> : <p className="leading-6 text-stone-600">Details to be supplied.</p>}
            </InfoCard>
          ))}
        </div>
      </PageSection>
    </SiteLayout>
  );
}
