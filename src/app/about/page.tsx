import { publicPageMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/button-link";
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
  { name: "Integrity", description: "We conduct every transaction with honesty, transparency and fairness." },
  { name: "Customer First", description: "We listen to our customers’ needs and strive to deliver genuine value and an exceptional experience." },
  { name: "Excellence", description: "We pursue high standards in our products, services, processes and relationships, continually seeking to improve." },
  { name: "Innovation", description: "We embrace new ideas, technology and better ways of doing things to create greater value." },
  { name: "Accountability", description: "We take ownership of our decisions, responsibilities, promises and results." },
  { name: "Sustainability", description: "We build businesses designed to create lasting economic, social and environmental value for future generations." },
  { name: "Teamwork", description: "We believe great results come through collaboration, mutual respect, communication and shared responsibility." },
  { name: "Value Creation", description: "Everything we do should create measurable, meaningful value for our customers, investors, employees, partners and communities." }
];

export const metadata = publicPageMetadata("/about", "About us", "Meet De Jadon Group, learn about our founder, and explore our vision, mission and core values.");

export default function AboutPage() {
  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title="About De Jadon Group"
          eyebrow="About"
          actions={
            <>
              <ButtonLink href="/businesses">Explore our businesses</ButtonLink>
              <ButtonLink href="/contact" variant="outline">Contact</ButtonLink>
            </>
          }
        >
          <div className="space-y-4">
            <p>{aboutSections[0].body}</p>
            <p>De Jadon Group was created to address the difficulty of accessing credible investment opportunities, owning appreciating assets and building sustainable additional sources of income in Nigeria.</p>
          </div>
        </PageHero>
      </PageSection>

      <PageSection tinted>
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-3">
          {aboutSections.slice(1).map((section) => (
            <article key={section.title} className="border-t border-ink/10 pt-6">
              <h2 className="text-2xl font-medium text-ink">{section.title}</h2>
              <p className="mt-4 leading-7 text-stone-700">{section.body}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeader title="Our areas of work" />
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            <div className="border-t border-ink/10 pt-5"><h3 className="text-xl text-ink">Agriculture</h3><p className="mt-3 text-sm leading-7 text-stone-600">Managed agricultural opportunities and food production, with a focus on palm plantation development.</p></div>
            <div className="border-t border-ink/10 pt-5"><h3 className="text-xl text-ink">Real estate</h3><p className="mt-3 text-sm leading-7 text-stone-600">Agricultural land and other property opportunities for individuals and organizations.</p></div>
            <div className="border-t border-ink/10 pt-5"><h3 className="text-xl text-ink">Flexisave</h3><p className="mt-3 text-sm leading-7 text-stone-600">A structured savings solution designed to support disciplined financial planning and personal goals.</p></div>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeader title="Core Values" />
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {values.map((value) => (
              <li key={value.name} className="border-b border-ink/10 py-5 text-base text-ink">
                <h3 className="font-sans text-base font-semibold">{value.name}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-600">{value.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </PageSection>

      <PageSection tinted>
        <div className="grid gap-10 border-t border-ink/10 pt-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeader title="Our leadership" eyebrow="Founder & Managing Director" />
          <div className="space-y-4 text-stone-700">
              <h3 className="text-3xl font-medium text-ink">Ifeanyi Luke Ananwude</h3>
              <p className="leading-7">
                Ifeanyi Luke Ananwude is an entrepreneur, farmer, and the founder of De Jadon Group. He is passionate about creating sustainable value through Agro Real Estate, Agriculture and business innovation. Guided by integrity, excellence and a customer-first approach, he is committed to building trusted brands, empowering communities and delivering lasting value that positively impacts lives.
              </p>
          </div>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
