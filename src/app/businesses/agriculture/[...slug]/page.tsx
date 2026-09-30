import { notFound } from "next/navigation";
import { ContentSlot } from "@/components/content-slot";
import { ImageCanvas } from "@/components/image-canvas";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionGrid } from "@/components/section-grid";
import { SiteLayout } from "@/components/site-layout";
import { agricultureProducts, getBusinessBySlug, getSectionByPath } from "@/lib/site-data";

type AgricultureSectionPageProps = { params: { slug: string[] } };

export function generateStaticParams() {
  return [
    { slug: ["crop-farming"] },
    { slug: ["livestock"] },
    { slug: ["livestock", "poultry"] },
    { slug: ["livestock", "fishery"] },
    { slug: ["livestock", "bsf"] },
    { slug: ["products"] },
    { slug: ["gallery"] }
  ];
}

export default function AgricultureSectionPage({ params }: AgricultureSectionPageProps) {
  const path = "/businesses/agriculture/" + params.slug.join("/");
  const match = getSectionByPath(path);
  const agriculture = getBusinessBySlug("agriculture");

  if (!match || !agriculture || match.business.slug !== "agriculture") notFound();

  const isProducts = path === "/businesses/agriculture/products";
  const isLivestock = path === "/businesses/agriculture/livestock";
  const isGallery = path === "/businesses/agriculture/gallery";
  const isCropFarming = path === "/businesses/agriculture/crop-farming";
  const isDetailOnly = !isProducts && !isLivestock && !isGallery && !isCropFarming;

  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title={match.section.name}
          eyebrow="Agriculture"
          canvasLabel={"Agriculture " + match.section.name + " Image Canvas"}
          accent="green"
        >
          <ContentSlot label={match.section.name + " Overview Slot"} accent="green" />
        </PageHero>
      </PageSection>

      {isCropFarming ? (
        <PageSection tinted>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard title="Palm" accent="green">
              <p className="leading-6 text-stone-700">The oil palm is a tropical tree widely cultivated in Nigeria and other parts of the world. The outer fleshy portion contains palm oil while the hard seed contains the palm kernel, which can be processed to produce palm kernel oil.</p>
            </InfoCard>
            <InfoCard title="Pepper" accent="green">
              <p className="leading-6 text-stone-700">Pepper is generally a small to medium-sized bushy plant with a relatively soft green stem that becomes stronger as the plant matures.</p>
            </InfoCard>
            <InfoCard title="Cassava" accent="green">
              <p className="leading-6 text-stone-700">Cassava is a perennial shrub commonly cultivated as an annual or biennial crop. It has an upright, branching stem and can grow to approximately 1–3 metres depending on variety and growing conditions.</p>
            </InfoCard>
          </div>
        </PageSection>
      ) : null}

      {isLivestock ? (
        <PageSection tinted>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard title="Poultry" canvasLabel="Poultry Image Canvas" accent="green">
              <p className="leading-6 text-stone-700">Poultry birds provide meat, eggs, manure and other valuable products.</p>
            </InfoCard>
            <InfoCard title="Fishery" canvasLabel="Fishery Image Canvas" accent="green">
              <p className="leading-6 text-stone-700">A fish is an aquatic vertebrate animal that lives primarily in water.</p>
            </InfoCard>
            <InfoCard title="Black Soldier Fly (BSF)" canvasLabel="BSF Image Canvas" accent="green">
              <p className="leading-6 text-stone-700">Black Soldier Fly is a non-pest insect found in many warm regions of the world. It is usually dark grey to black and contains significant amounts of protein and fat.</p>
            </InfoCard>
          </div>
        </PageSection>
      ) : null}

      {isProducts ? (
        <PageSection tinted>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agricultureProducts.map((product) => (
              <InfoCard key={product} title={product} canvasLabel={product + " Image Canvas"} accent="green" />
            ))}
          </div>
        </PageSection>
      ) : null}

      {isGallery ? (
        <PageSection tinted>
          <div className="grid gap-4 md:grid-cols-3">
            <ImageCanvas label="Agriculture Gallery Canvas" accent="green" compact />
            <ImageCanvas label="Agriculture Gallery Canvas" accent="green" compact />
            <ImageCanvas label="Agriculture Gallery Canvas" accent="green" compact />
          </div>
        </PageSection>
      ) : null}

      {isDetailOnly ? (
        <PageSection tinted>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title={match.section.name + " Detail"} slotLabel={match.section.name + " Detail Slot"} accent="green" />
            <InfoCard title={match.section.name + " Gallery"} canvasLabel={match.section.name + " Gallery Canvas"} accent="green" />
          </div>
        </PageSection>
      ) : null}

      {isOverview ? (
        <PageSection>
          <div className="grid gap-4 lg:grid-cols-2">
            {agricultureFaqs.map((faq) => (
              <article key={faq.question} className="rounded-card border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-ink">{faq.question}</h2>
                <p className="mt-3 leading-6 text-stone-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </PageSection>
      ) : null}
    </SiteLayout>
  );
}
