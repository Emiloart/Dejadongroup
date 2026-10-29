import { ButtonLink } from "@/components/button-link";
import { heroMedia } from "@/lib/hero-media";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionGrid } from "@/components/section-grid";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { agroRealEstateServices, getBusinessBySlug } from "@/lib/site-data";

export default function AgroRealEstatePage() {
  const business = getBusinessBySlug("agro-real-estate");

  if (!business) {
    return null;
  }

  return (
    <SiteLayout>
      <PageHero
        title={business.name}
        eyebrow="Businesses"
        image={heroMedia.agroRealEstate}
        actions={
          <>
            <ButtonLink href="/businesses/agro-real-estate/investment-plans">Investment Plans</ButtonLink>
            <ButtonLink href="/contact" variant="inverse">
              Contact
            </ButtonLink>
          </>
        }
      >
        <div className="space-y-4">
          <p>Making life easier through land, agriculture and opportunity.</p>
          <p>We bring together real estate, food solutions and productive assets to create lasting value for individuals, families, businesses and communities. Whether you want to own land or explore agricultural opportunities, our team is here to guide you.</p>
        </div>
      </PageHero>
      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title="Land ownership meets agriculture." eyebrow="How it works" />
          <div className="space-y-4 text-sm leading-7 text-stone-600">
            <p>Agro-Real Estate combines agriculture and real estate: land is acquired, developed, managed or sold specifically for agricultural purposes and related investments.</p>
            <p>Our ideal customers have an interest in land ownership, agriculture and long-term investment opportunities. The customer journey moves from interest and choice to payment, documentation, participation and value.</p>
          </div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">{agroRealEstateServices.map((service) => <article key={service.name} className="border-t border-ink/10 pt-5"><h2 className="text-xl">{service.name}</h2>{service.description ? <p className="mt-3 text-sm leading-7 text-stone-600">{service.description}</p> : null}{service.audience ? <p className="mt-3 text-sm leading-7 text-stone-600">For {service.audience.charAt(0).toLowerCase() + service.audience.slice(1)}</p> : null}<div className="mt-4"><ButtonLink href="/contact" variant="outline">Enquire about this service</ButtonLink></div></article>)}</div>
      </PageSection>
      <PageSection tinted>
        <div className="mb-10">
          <SectionHeader title="Explore agro-real estate" />
        </div>
        <SectionGrid sections={business.sections.filter((section) => section.href !== business.href)} />
      </PageSection>
    </SiteLayout>
  );
}
