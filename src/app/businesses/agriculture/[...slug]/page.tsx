import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionGrid } from "@/components/section-grid";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { agricultureProducts, getSectionByPath } from "@/lib/site-data";

const cropDescriptions = [
  { name: "Palm", description: "The oil palm is a tropical tree. Its outer flesh contains palm oil, while the seed can be processed to produce palm kernel oil." },
  { name: "Pepper", description: "Pepper grows as a bushy plant with a soft green stem that becomes stronger as it matures." },
  { name: "Cassava", description: "Cassava is a perennial shrub commonly grown as an annual or biennial crop." }
];

const livestockDescriptions: Record<string, string> = {
  poultry: "Poultry birds provide meat, eggs, manure and other valuable products.",
  fishery: "Fish farming is part of De Jadon Group's agriculture operations.",
  bsf: "Black Soldier Fly is a non-pest insect containing significant amounts of protein and fat."
};

type AgricultureSectionPageProps = { params: { slug: string[] } };

export function generateStaticParams() {
  return [
    { slug: ["crop-farming"] }, { slug: ["livestock"] },
    { slug: ["livestock", "poultry"] }, { slug: ["livestock", "fishery"] },
    { slug: ["livestock", "bsf"] }, { slug: ["products"] }, { slug: ["gallery"] }
  ];
}

export default function AgricultureSectionPage({ params }: AgricultureSectionPageProps) {
  const path = `/businesses/agriculture/${params.slug.join("/")}`;
  const match = getSectionByPath(path);
  if (!match || match.business.slug !== "agriculture") notFound();

  const category = params.slug[0];
  const detail = params.slug[1];
  const intro = category === "crop-farming"
    ? "Explore the crops cultivated as part of De Jadon Group's agriculture work."
    : category === "livestock" && detail
      ? livestockDescriptions[detail]
      : category === "livestock"
        ? "Our agriculture operations include poultry, fishery and Black Soldier Fly."
        : category === "products"
          ? "Our agricultural products include fresh and dried fish. Product sales are being prepared for a separate marketplace."
          : "Images of our agriculture work will be added when available.";

  return (
    <SiteLayout>
      <PageSection>
        <PageHero title={match.section.name} eyebrow="Agriculture" accent="green" actions={<ButtonLink href="/businesses/agriculture" variant="outline">Back to agriculture</ButtonLink>}>
          <p>{intro}</p>
        </PageHero>
      </PageSection>
      {category === "crop-farming" ? (
        <PageSection tinted>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <SectionHeader title="Crops" accent="green" />
            <div className="grid gap-8 sm:grid-cols-2">
              {cropDescriptions.map((crop) => (
                <article key={crop.name} className="border-t border-ink/10 pt-5">
                  <h2 className="text-xl text-ink">{crop.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{crop.description}</p>
                </article>
              ))}
            </div>
          </div>
        </PageSection>
      ) : null}
      {category === "livestock" && !detail ? (
        <PageSection tinted>
          <SectionHeader title="Explore livestock" accent="green" />
          <div className="mt-8"><SectionGrid sections={match.section.sections ?? []} accent="green" /></div>
        </PageSection>
      ) : null}
      {category === "products" ? (
        <PageSection tinted>
          <SectionHeader title="Available products" accent="green" />
          <ul className="mt-8 grid gap-x-10 sm:grid-cols-3">
            {agricultureProducts.map((product) => <li key={product} className="border-t border-ink/10 py-5 text-lg text-ink">{product}</li>)}
          </ul>
          <ButtonLink href="/contact" variant="outline">Ask about products</ButtonLink>
        </PageSection>
      ) : null}
      {category === "gallery" || detail ? (
        <PageSection tinted>
          <div className="flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 pt-8">
            <p className="max-w-xl text-stone-600">For more information about {match.section.name.toLowerCase()}, contact our team.</p>
            <ButtonLink href="/contact">Contact us</ButtonLink>
          </div>
        </PageSection>
      ) : null}
    </SiteLayout>
  );
}
