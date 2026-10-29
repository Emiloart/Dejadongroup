import { publicPageMetadata } from "@/lib/seo";
import { managedContent } from "@/lib/managed-content";
import { ManagedPublicContent } from "@/components/managed-public-content";
import { ButtonLink } from "@/components/button-link";
import { BusinessCarousel } from "@/components/business-carousel";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { HeroBackground } from "@/components/hero-background";
import { HomeFaq } from "@/components/home-faq";
import { OfficeMapPreview } from "@/components/office-map-preview";
import { NewsCarousel } from "@/components/news-carousel";
import { NewsletterSection } from "@/components/newsletter-section";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { businesses, companyContact, founderMessage, homeFaqSections, homeHeroSlides } from "@/lib/site-data";
import { heroMedia } from "@/lib/hero-media";
import { getPublishedNews } from "@/lib/news-store";

export const metadata = publicPageMetadata("/", "De Jadon Group", "Explore De Jadon Group’s agriculture, agro-real estate, Flexisave and partner opportunities in Nigeria.");

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getPublishedNews();
  const about = (await managedContent()).find((item) => item.kind === "homepage" && item.slug === "about" && item.status === "published");
  return (
    <SiteLayout>
      <HomeHeroCarousel slides={homeHeroSlides} />
      <PageSection tinted>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title={about?.title || "About De Jadon Group"} eyebrow="Who we are" />
          <div>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">{about?.body || "De Jadon Group brings together agriculture, real estate and Flexisave to help individuals, families and businesses build and preserve wealth."}</p>
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
      <section aria-labelledby="partner-promo-heading" className="relative isolate overflow-hidden bg-ink text-white">
        <HeroBackground image={heroMedia.partner} />
        <div className="mx-auto flex min-h-[360px] max-w-7xl items-center px-5 py-14 sm:px-6 sm:py-16 lg:min-h-[400px] lg:px-8 lg:py-20">
          <div className="max-w-xl [text-shadow:0_1px_6px_rgb(0_0_0_/_0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Partner Programme</p>
            <h2 id="partner-promo-heading" className="mt-4 text-3xl font-medium leading-[1.12] tracking-tight sm:text-4xl">Grow with us.</h2>
            <p className="mt-5 text-base leading-8 text-white/90 sm:text-lg">The Partner Program allows individuals to introduce De Jadon Group to prospective customers and earn a 10% commission when a referred prospect becomes a paying client.</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <ButtonLink href="/partner-program">Explore the program</ButtonLink>
              <ButtonLink href="/login?role=partner" variant="inverse">Partner login</ButtonLink>
            </div>
          </div>
        </div>
      </section>
      <PageSection tinted>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title="Meet our founder" eyebrow="Leadership" />
          <div className="max-w-2xl">
            <h3 className="text-2xl text-ink">Ifeanyi Luke Ananwude</h3>
            <p className="mt-2 text-sm text-stone-500">Managing Director and founder of De Jadon Group.</p>
            <p className="mt-5 leading-7 text-stone-600">He is passionate about creating sustainable value through Agro Real Estate, Agriculture and business innovation, guided by integrity, excellence and a customer-first approach.</p>
            <blockquote className="mt-6 border-l-2 border-orangeAction pl-5 text-base leading-8 text-stone-700">“{founderMessage}”</blockquote>
            <div className="mt-4"><ButtonLink href="/about" variant="outline">Meet De Jadon Group</ButtonLink></div>
          </div>
        </div>
      </PageSection>
      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title="A little more clarity." eyebrow="Common questions" />
          <HomeFaq sections={homeFaqSections} />
        </div>
      </PageSection>
      <PageSection tinted>
        <div id="contact" className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orangeAction">Let’s talk</p>
            <h2 className="mt-3 text-3xl font-normal tracking-tight sm:text-4xl">Find your next opportunity.</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">Speak with our team about products, productive land or partnering with De Jadon Group.</p>
            <ButtonLink href="/contact" className="mt-6">Contact our team</ButtonLink>
          </div>
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Call us</dt><dd className="mt-2"><a href="tel:+2348070458759" className="break-words text-base font-semibold hover:text-orangeAction">08070458759</a></dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Email us</dt><dd className="mt-2"><a href="mailto:dejadongroup@gmail.com" className="break-all text-base font-semibold hover:text-orangeAction">dejadongroup@gmail.com</a></dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Visit our office</dt><dd className="mt-2 text-sm leading-7 text-stone-600"><p className="max-w-sm">{companyContact.office}</p><OfficeMapPreview className="mt-4" /></dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Working hours</dt><dd className="mt-2 text-sm leading-7 text-stone-600">{companyContact.workingHours}</dd></div>
          </dl>
        </div>
      </PageSection>
      <ManagedPublicContent />
      <NewsCarousel articles={articles} />
      <NewsletterSection />
    </SiteLayout>
  );
}
