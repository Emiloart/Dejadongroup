import { ButtonLink } from "@/components/button-link";
import { BusinessCarousel } from "@/components/business-carousel";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { HomeFaq } from "@/components/home-faq";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { businesses, homeFaqSections, homeHeroSlides } from "@/lib/site-data";

export default function HomePage() {
  return (
    <SiteLayout>
      <PageSection className="!pb-10 !pt-10 lg:!pt-16"><HomeHeroCarousel slides={homeHeroSlides} /></PageSection>
      <PageSection tinted>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title="About De Jadon Group" eyebrow="Who we are" />
          <div>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">De Jadon Group brings together agriculture, real estate and Flexisave to help individuals, families and businesses build and preserve wealth.</p>
            <div className="mt-5"><ButtonLink href="/about" variant="outline">Get to know us</ButtonLink></div>
          </div>
        </div>
      </PageSection>
      <PageSection>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <SectionHeader title="Our businesses" eyebrow="What we do" />
          <ButtonLink href="/businesses" variant="outline">Explore all businesses</ButtonLink>
        </div>
        <BusinessCarousel businesses={businesses} />
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title="Grow with us." eyebrow="Partner program" />
          <div>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">The Partner Program allows individuals to introduce De Jadon Group to prospective customers and earn a 10% commission when a referred prospect becomes a paying client.</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <ButtonLink href="/partner-program">Explore the program</ButtonLink>
              <ButtonLink href="/login" variant="outline">Partner login</ButtonLink>
            </div>
          </div>
        </div>
        <div className="mt-14 grid gap-8 border-t border-ink/10 pt-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title="Meet our founder" eyebrow="Leadership" />
          <div className="max-w-2xl">
            <h3 className="text-2xl text-ink">Ifeanyi Luke Ananwude</h3>
            <p className="mt-2 text-sm text-stone-500">Managing Director and founder of De Jadon Group.</p>
            <p className="mt-5 leading-7 text-stone-600">He is passionate about creating sustainable value through Agro Real Estate, Agriculture and business innovation, guided by integrity, excellence and a customer-first approach.</p>
          </div>
        </div>
      </PageSection>
      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title="A little more clarity." eyebrow="Common questions" />
          <HomeFaq sections={homeFaqSections} />
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-ink/10 pt-8 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-xl text-ink">News & updates</h2>
          <p className="text-sm leading-6 text-stone-500">Company updates will appear here when available.</p>
        </div>
      </PageSection>
      <PageSection tinted>
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orangeAction">Let’s talk</p>
            <h2 className="mt-3 text-3xl font-normal tracking-tight sm:text-4xl">Find your next opportunity.</h2>
          </div>
          <ButtonLink href="/contact" className="self-start sm:self-auto">Contact our team</ButtonLink>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
