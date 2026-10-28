import { BusinessCard } from "@/components/business-card";
import { ButtonLink } from "@/components/button-link";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { businesses } from "@/lib/site-data";

export default function BusinessesPage() {
  return (
    <SiteLayout>
      <PageSection>
        <PageHero title="Our businesses" eyebrow="De Jadon Group">
          <p>Explore our work in agriculture, real estate and structured savings.</p>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <SectionHeader title="Find your area of interest" />
        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {businesses.map((business) => (
            <BusinessCard key={business.slug} business={business} />
          ))}
        </div>
      </PageSection>
      <PageSection>
        <div className="mb-14 grid gap-8 border-b border-ink/10 pb-10 sm:grid-cols-2 sm:gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-ink">See our work</h2>
            <p className="mt-2 text-stone-600">Browse photographs from our business areas.</p>
            <div className="mt-4"><ButtonLink href="/gallery" variant="outline">Browse gallery</ButtonLink></div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-ink">Explore products</h2>
            <p className="mt-2 text-stone-600">Find agricultural products and food packages.</p>
            <div className="mt-4"><ButtonLink href="/marketplace" variant="outline">Browse marketplace</ButtonLink></div>
          </div>
        </div>
        <div className="grid gap-8 border-t border-ink/10 pt-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title="Flexisave" eyebrow="Structured savings" />
          <div>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">Flexisave is De Jadon Group’s structured savings solution, designed to encourage disciplined financial planning and help people work towards specific financial goals.</p>
            <div className="mt-6"><ButtonLink href="/contact" variant="outline">Ask about Flexisave</ButtonLink></div>
          </div>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
