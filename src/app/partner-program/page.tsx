import { ButtonLink } from "@/components/button-link";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { getPublicPartnerTiers } from "@/lib/partner-store";
import { partnerMoney } from "@/lib/partner-types";

export const dynamic = "force-dynamic";
export default async function PartnerProgramPage({ searchParams }: { searchParams?: { ref?: string } }) {
  const tiers = await getPublicPartnerTiers();
  const register = `/login?role=partner&mode=signup${searchParams?.ref ? `&ref=${encodeURIComponent(searchParams.ref.slice(0, 40))}` : ""}`;
  return (
    <SiteLayout>
      <PageSection>
        <PageHero title="Partner Programme" eyebrow="De Jadon Group" actions={<ButtonLink href={register}>Become a partner</ButtonLink>}>
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
            <p className="mt-7 text-sm leading-7 text-stone-600">Registration has two stages: create your account and verify your email, then add your personal details, select a tier and complete the applicable payment. Promo codes are checked against your selected tier.</p>
            <div className="mt-5 flex flex-wrap gap-4"><ButtonLink href={register}>Register as a partner</ButtonLink><ButtonLink href="/login?role=partner" variant="outline">Partner sign in</ButtonLink></div>
          </div>
        </div>
      </PageSection>
      <PageSection><SectionHeader title="Partner tiers" eyebrow="Choose your membership" /><div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{tiers.map((tier) => <article key={tier.id} className="min-w-0 rounded-card border border-ink/10 bg-white p-6"><h3 className="break-words text-2xl">{tier.name}</h3><p className="mt-3 text-2xl">{partnerMoney(tier.feeKobo)}</p><p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-stone-600">{tier.description}</p>{tier.benefits.length ? <ul className="mt-5 space-y-3">{tier.benefits.map((benefit) => <li key={benefit.id} className="break-words text-sm"><span className="font-semibold">✓ {benefit.title}</span>{benefit.summary ? <p className="mt-1 text-xs leading-6 text-stone-600">{benefit.summary}</p> : null}</li>)}</ul> : null}<div className="mt-6"><ButtonLink href={register} variant="outline">Choose this tier</ButtonLink></div></article>)}</div>{!tiers.length ? <p className="mt-5 text-sm leading-7 text-stone-600">The team is preparing the available tiers. You can create and verify your account now, then return to select a tier when registration options are published.</p> : null}<p className="mt-7 max-w-3xl text-sm leading-7 text-stone-600">A valid promo covering the entire registration fee requires a refundable ₦100 eligibility payment. Its refund is requested immediately after payment confirmation. Registered partners can upgrade by paying the difference between current tier prices.</p></PageSection>
    </SiteLayout>
  );
}
