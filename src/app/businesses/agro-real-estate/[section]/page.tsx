import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { agroRealEstateBuyingProcess, agroRealEstateFaqs, agroRealEstateServices, getSectionByPath } from "@/lib/site-data";

type AgroRealEstateSectionPageProps = { params: { section: string } };

export function generateStaticParams() {
  return [
    { section: "buy-cultivated-farmland" }, { section: "managed-cultivation" },
    { section: "investment-plans" }, { section: "faqs" }, { section: "gallery" }
  ];
}

export default function AgroRealEstateSectionPage({ params }: AgroRealEstateSectionPageProps) {
  const path = `/businesses/agro-real-estate/${params.section}`;
  const match = getSectionByPath(path);
  if (!match || match.business.slug !== "agro-real-estate") notFound();

  const isFaq = params.section === "faqs";
  const isGallery = params.section === "gallery";
  const isBuying = params.section === "buy-cultivated-farmland" || params.section === "managed-cultivation";
  const intro = params.section === "buy-cultivated-farmland"
    ? "Agricultural land sales provide land for agricultural purposes and investment opportunities."
    : params.section === "managed-cultivation"
      ? "De Jadon Group manages plantations for customers as part of its agricultural land and development offering."
      : isFaq
        ? "Answers to common questions about agricultural land and managed cultivation."
        : isGallery
          ? "Project images will be added when available."
          : "Ask our team about current agricultural land and investment opportunities.";

  return (
    <SiteLayout>
      <PageSection>
        <PageHero title={match.section.name} eyebrow="Agro-Real Estate" actions={<ButtonLink href="/businesses/agro-real-estate" variant="outline">Back to agro-real estate</ButtonLink>}>
          <p>{intro}</p>
        </PageHero>
      </PageSection>
      {isBuying ? (
        <PageSection tinted>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <section>
              <SectionHeader title="How buying works" />
              <ol className="mt-7 space-y-5">
                {agroRealEstateBuyingProcess.map((step, index) => (
                  <li key={step} className="flex gap-5 border-t border-ink/10 pt-4 text-sm leading-7 text-stone-600">
                    <span className="font-semibold tabular-nums text-orangeAction">{String(index + 1).padStart(2, "0")}</span>{step}
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <SectionHeader title="Services" />
              <div className="mt-7 space-y-5">
                {agroRealEstateServices.map((service) => (
                  <article key={service.name} className="border-t border-ink/10 pt-4">
                    <h3 className="text-lg text-ink">{service.name}</h3>
                    {service.description ? <p className="mt-2 text-sm leading-7 text-stone-600">{service.description}</p> : null}
                    {service.audience ? <p className="mt-2 text-sm leading-7 text-stone-600">For {service.audience.charAt(0).toLowerCase() + service.audience.slice(1)}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          </div>
        </PageSection>
      ) : null}
      {isFaq ? (
        <PageSection tinted>
          <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
            {agroRealEstateFaqs.map((faq) => (
              <article key={faq.question} className="border-t border-ink/10 pt-5">
                <h2 className="text-lg text-ink">{faq.question}</h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </PageSection>
      ) : null}
      {isGallery || params.section === "investment-plans" ? (
        <PageSection tinted>
          <div className="flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 pt-8">
            <p className="max-w-xl text-stone-600">Contact our team for current information about {match.section.name.toLowerCase()}.</p>
            <ButtonLink href="/contact">Contact us</ButtonLink>
          </div>
        </PageSection>
      ) : null}
    </SiteLayout>
  );
}
