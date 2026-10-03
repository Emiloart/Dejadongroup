import { ButtonLink } from "@/components/button-link";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";

export default function PartnerProgramPage() {
  return (
    <SiteLayout>
      <PageSection>
        <PageHero title="Partner Program" eyebrow="De Jadon Group" actions={<ButtonLink href="/contact">Ask about becoming a partner</ButtonLink>}>
          <p>Introduce De Jadon Group to a prospective customer. When that person becomes a paying client, the partner receives a 10% commission from the company.</p>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title="How referrals work" eyebrow="The approved rule" />
          <div>
            <ol className="divide-y divide-ink/10 border-y border-ink/10">
              <li className="flex gap-5 py-5 text-stone-600"><span className="font-semibold text-orangeAction">01</span>Introduce De Jadon Group to a prospective client.</li>
              <li className="flex gap-5 py-5 text-stone-600"><span className="font-semibold text-orangeAction">02</span>The prospect becomes a paying client.</li>
              <li className="flex gap-5 py-5 text-stone-600"><span className="font-semibold text-orangeAction">03</span>The company pays the partner a 10% commission.</li>
            </ol>
            <p className="mt-7 text-sm leading-7 text-stone-600">Partner tiers, fees and registration details have not yet been supplied. Contact the team for current information.</p>
            <div className="mt-5"><ButtonLink href="/login" variant="outline">Explore the portal preview</ButtonLink></div>
          </div>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
