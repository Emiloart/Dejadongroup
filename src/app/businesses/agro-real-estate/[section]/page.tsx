import { notFound } from "next/navigation";
import { ImageCanvas } from "@/components/image-canvas";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SiteLayout } from "@/components/site-layout";
import { agroRealEstateBuyingProcess, agroRealEstateFaqs, agroRealEstateServices, getSectionByPath } from "@/lib/site-data";

type AgroRealEstateSectionPageProps = { params: { section: string } };

export function generateStaticParams() {
  return [
    { section: "buy-cultivated-farmland" },
    { section: "managed-cultivation" },
    { section: "investment-plans" },
    { section: "faqs" },
    { section: "gallery" }
  ];
}

export default function AgroRealEstateSectionPage({ params }: AgroRealEstateSectionPageProps) {
  const path = "/businesses/agro-real-estate/" + params.section;
  const match = getSectionByPath(path);

  if (!match || match.business.slug !== "agro-real-estate") notFound();

  const isGallery = path === "/businesses/agro-real-estate/gallery";
  const isFaqs = path === "/businesses/agro-real-estate/faqs";
  const isBuy = path === "/businesses/agro-real-estate/buy-cultivated-farmland";
  const isManaged = path === "/businesses/agro-real-estate/managed-cultivation";

  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title={match.section.name}
          eyebrow="Agro-Real Estate"
          canvasLabel={"Agro-Real Estate " + match.section.name + " Image Canvas"}
        >
          <p className="max-w-3xl leading-7 text-stone-700">
            {isBuy
              ? "Agricultural land sales provide land for agricultural purposes and investment opportunities."
              : isManaged
                ? "De Jadon Group manages plantations for customers as part of its agricultural land and development offering."
                : "Explore De Jadon Group's Agro-Real Estate services and opportunities."}
          </p>
        </PageHero>
      </PageSection>

      {isBuy || isManaged ? (
        <PageSection tinted>
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-card border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-ink">How it works</h2>
              <ol className="mt-5 space-y-3 text-stone-700">
                {agroRealEstateBuyingProcess.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="font-semibold text-orangeAction">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>
            <article className="rounded-card border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-ink">Services</h2>
              <div className="mt-4 grid gap-3">
                {agroRealEstateServices.map((service) => (
                  <div key={service.name}>
                    <h3 className="font-semibold text-ink">{service.name}</h3>
                    {service.description ? <p className="mt-1 text-sm leading-6 text-stone-700">{service.description}</p> : null}
                    {service.audience ? <p className="mt-1 text-sm leading-6 text-stone-600">For: {service.audience}</p> : null}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </PageSection>
      ) : null}

      {isFaqs ? (
        <PageSection tinted>
          <div className="grid gap-4 lg:grid-cols-2">
            {agroRealEstateFaqs.map((faq) => (
              <article key={faq.question} className="rounded-card border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-ink">{faq.question}</h2>
                <p className="mt-3 leading-6 text-stone-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </PageSection>
      ) : null}

      {isGallery ? (
        <PageSection tinted>
          <div className="grid gap-4 md:grid-cols-3">
            <ImageCanvas label="Agro-Real Estate Gallery Canvas" compact />
            <ImageCanvas label="Agro-Real Estate Gallery Canvas" compact />
            <ImageCanvas label="Agro-Real Estate Gallery Canvas" compact />
          </div>
        </PageSection>
      ) : null}

      {!isGallery && !isFaqs && !isBuy && !isManaged ? (
        <PageSection tinted>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title={match.section.name + " Details"} slotLabel={match.section.name + " Details Slot"} />
            <InfoCard title={match.section.name + " Inquiry"} slotLabel={match.section.name + " Inquiry Slot"} href="/contact" />
          </div>
        </PageSection>
      ) : null}
    </SiteLayout>
  );
}
