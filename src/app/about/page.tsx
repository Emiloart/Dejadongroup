import { ButtonLink } from "@/components/button-link";
import { ImageCanvas } from "@/components/image-canvas";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";

const aboutSections = [
  {
    title: "About De Jadon Group",
    body: "De Jadon Group is a Nigerian investment and wealth-creation company focused on creating practical opportunities for individuals, families, businesses and organizations to build and preserve wealth. We combine agriculture, real estate and structured savings solutions to provide opportunities that can generate short-term financial value and long-term asset appreciation."
  },
  {
    title: "Vision",
    body: "To build a trusted and diversified African business group that transforms land, agricultural, and financial opportunities into sustainable wealth, creating lasting value for our customers, partners, employees, and communities."
  },
  {
    title: "Mission",
    body: "Our mission is to provide every household with healthy foodstuffs, transform agricultural resources into profitable businesses while making productive assets accessible to individuals, families and organizations."
  },
  {
    title: "Why Choose De Jadon Group?",
    body: "We choose to build on trust, integrity, innovation, and value creation. At De Jadon Group, we don’t just provide products and services, we create opportunities designed to help our customers achieve their financial and lifestyle goals. With commitment to transparency, professionalism, quality service, and long-term value, we are building a brand that you can confidently grow with."
  }
];

const values = [
  "Integrity",
  "Customer First",
  "Excellence",
  "Innovation",
  "Accountability",
  "Sustainability",
  "Teamwork",
  "Value Creation"
];

export default function AboutPage() {
  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title="About De Jadon Group"
          eyebrow="About"
          canvasLabel="About Image Canvas"
          actions={
            <>
              <ButtonLink href="/businesses">Businesses</ButtonLink>
              <ButtonLink href="/contact" variant="outline">Contact</ButtonLink>
            </>
          }
        >
          <p className="max-w-2xl text-base leading-7 text-stone-700">{aboutSections[0].body}</p>
        </PageHero>
      </PageSection>

      <PageSection tinted>
        <div className="grid gap-5 md:grid-cols-2">
          {aboutSections.slice(1).map((section) => (
            <article key={section.title} className="rounded-card border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
              <p className="mt-4 leading-7 text-stone-700">{section.body}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader title="Core Values" />
          <div className="flex flex-wrap gap-3">
            {values.map((value) => (
              <span key={value} className="rounded-full border border-orangeAction/20 bg-orange-50 px-4 py-2 text-sm font-semibold text-ink">
                {value}
              </span>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection tinted>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionHeader title="Founder & Managing Director" />
            <div className="mt-6 space-y-4 text-stone-700">
              <h2 className="text-2xl font-semibold text-ink">Ifeanyi Luke Ananwude</h2>
              <p className="leading-7">
                Ananwude Ifeany Luke is an entrepreneur, farmer, and the founder of De Jadon Group. He is passionate about creating sustainable value through Agro Real Estate, Agriculture and business innovation. Guided by integrity, excellence and a customer-first approach, he is committed to building trusted brands, empowering communities and delivering lasting value that positively impacts lives.
              </p>
            </div>
          </div>
          <ImageCanvas label="CEO Image Canvas" />
        </div>
      </PageSection>
    </SiteLayout>
  );
}
