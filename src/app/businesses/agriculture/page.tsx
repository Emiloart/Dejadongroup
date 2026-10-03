import { ButtonLink } from "@/components/button-link";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionGrid } from "@/components/section-grid";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { agricultureFaqs, agricultureProducts, getBusinessBySlug } from "@/lib/site-data";

export default function AgriculturePage() {
  const agriculture = getBusinessBySlug("agriculture");

  if (!agriculture) {
    return null;
  }

  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title={agriculture.name}
          eyebrow="Businesses"
          accent="green"
          actions={
            <>
              <ButtonLink href="/businesses/agriculture/products">Products</ButtonLink>
              <ButtonLink href="/businesses/agriculture/gallery" variant="outline">
                Gallery
              </ButtonLink>
            </>
          }
        >
          <p>We are involved in agricultural activities aimed at producing food and other agricultural products. This includes crop farming and livestock/fish farming. De Jadon Group is not just about farming; it is about connecting land ownership, investment and food supply into one business model. The services currently provided include real estate services, agricultural services, food packages and investment opportunities.</p>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="mb-10">
          <SectionHeader title="Explore agriculture" accent="green" />
        </div>
        <SectionGrid sections={agriculture.sections.filter((section) => section.href !== agriculture.href)} accent="green" />
      </PageSection>
      <PageSection>
        <div className="grid gap-10 border-t border-ink/10 pt-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeader title="From our farms" eyebrow="Products" accent="green" />
            <div className="mt-6">
              <ButtonLink href="/businesses/agriculture/products" variant="outline">View all products</ButtonLink>
            </div>
          </div>
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {agricultureProducts.map((product) => (
              <InfoCard
                key={product}
                title={product}
                accent="green"
              />
            ))}
          </div>
        </div>
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeader title="Frequently asked questions" eyebrow="Good to know" accent="green" />
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {agricultureFaqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span aria-hidden="true" className="text-xl font-normal text-agriculture transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pb-1 pt-4 leading-7 text-stone-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
